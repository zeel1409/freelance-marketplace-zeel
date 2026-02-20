// Backend server created by Zeel Kadiya
// Handles API requests and database communication


import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PORT = process.env.PORT || 3001;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// extend Express Request to include authenticated user and profile
interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'client' | 'freelancer';
  avatar_url: string | null;
  bio: string | null;
  skills: string[] | null;
  created_at: string;
  updated_at: string;
}

interface Gig {
  id: string;
  freelancer_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  delivery_days: number;
  image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  gig_id: string;
  client_id: string;
  freelancer_id: string;
  status: string;
  price: number;
  requirements: string | null;
  delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Review {
  id: string;
  order_id: string;
  gig_id: string;
  client_id: string;
  freelancer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  profile?: Profile;
}

// Middleware to validate bearer token and attach user + profile
async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No authorization header provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed authorization header' });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = userData.user;

  // fetch profile row
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();
  if (profileError) {
    return res.status(500).json({ error: 'Failed to load user profile' });
  }
  req.profile = profile;
  next();
}

const app = express();
app.use(cors());
app.use(express.json());

// --- auth routes ---

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, full_name, role } = req.body;
  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const user = data.user;
  const token = data.session?.access_token;

  // create profile row
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user?.id,
    email,
    full_name,
    role,
  });
  if (profileError) {
    console.error('profile insert error', profileError);
  }

  res.json({ token, user: { id: user?.id, email, full_name, role } });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return res.status(401).json({ error: error?.message || 'Login failed' });
  }

  const user = data.user;
  const token = data.session.access_token;

  // fetch profile data
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  res.json({ token, user: profile || { id: user.id, email } });
});

app.get('/api/auth/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.profile });
});

// --- gigs ---

app.get('/api/gigs', async (req: Request, res: Response) => {
  const { search, category, freelancer } = req.query as Record<string, string>;
  let query = supabase.from('gigs').select('*, profiles(*)');
  if (category) query = query.eq('category', category);
  if (freelancer) query = query.eq('freelancer_id', freelancer);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ gigs: data });
});

app.get('/api/gigs/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('gigs')
    .select('*, profiles(*), reviews(*)')
    .eq('id', id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ gig: data });
});

app.post('/api/gigs', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const profile = req.profile!;
  if (profile.role !== 'freelancer') {
    return res.status(403).json({ error: 'Only freelancers may create gigs' });
  }
  const { title, description, category, price, delivery_days, image_url } = req.body;
  const { data: gigsData, error } = await supabase
    .from('gigs')
    .insert({
      freelancer_id: profile.id,
      title,
      description,
      category,
      price: parseInt(price, 10),
      delivery_days: parseInt(delivery_days, 10),
      image_url,
    });
  const gigsArray = gigsData as Gig[] | null;
  if (error || !gigsArray || gigsArray.length === 0) {
    return res.status(500).json({ error: error?.message || 'Failed to create gig' });
  }
  res.json({ gig: gigsArray[0] });
});

app.put('/api/gigs/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const profile = req.profile!;
  const { id } = req.params;
  const updates = req.body;
  const { data: gig, error: fetchErr } = await supabase.from('gigs').select('*').eq('id', id).single();
  if (fetchErr || !gig) return res.status(404).json({ error: 'Gig not found' });
  if (gig.freelancer_id !== profile.id) return res.status(403).json({ error: 'Not your gig' });

  const { data: gigsData, error } = await supabase
    .from('gigs')
    .update(updates)
    .eq('id', id);
  const gigsArray = gigsData as Gig[] | null;
  if (error || !gigsArray || gigsArray.length === 0) {
    return res.status(500).json({ error: error?.message || 'Failed to update gig' });
  }
  res.json({ gig: gigsArray[0] });
});

app.delete('/api/gigs/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const profile = req.profile!;
  const { id } = req.params;
  const { data: gig, error: fetchErr } = await supabase.from('gigs').select('*').eq('id', id).single();
  if (fetchErr || !gig) return res.status(404).json({ error: 'Gig not found' });
  if (gig.freelancer_id !== profile.id) return res.status(403).json({ error: 'Not your gig' });

  const { error } = await supabase.from('gigs').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Deleted' });
});

// --- orders ---

app.get('/api/orders', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const profile = req.profile!;
  const { data, error } = await supabase
    .from('orders')
    .select('*, gigs(*), client:profiles(*), freelancer:profiles(*)')
    .or(`client_id.eq.${profile.id},freelancer_id.eq.${profile.id}`);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ orders: data });
});

app.post('/api/orders', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const profile = req.profile!;
  if (profile.role !== 'client')
    return res.status(403).json({ error: 'Only clients may create orders' });

  const { gig_id, requirements } = req.body;
  const { data: gig, error: gigErr } = await supabase.from('gigs').select('*').eq('id', gig_id).single();
  if (gigErr || !gig) return res.status(404).json({ error: 'Gig not found' });

  const { data: ordersData, error } = await supabase
    .from('orders')
    .insert({
      gig_id,
      client_id: profile.id,
      freelancer_id: gig.freelancer_id,
      price: gig.price,
      requirements,
    });
  const ordersArray = ordersData as Order[] | null;
  if (error || !ordersArray || ordersArray.length === 0) {
    return res.status(500).json({ error: error?.message || 'Failed to create order' });
  }
  res.json({ order: ordersArray[0] });
});

app.put('/api/orders/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const profile = req.profile!;
  const { id } = req.params;
  const { status } = req.body;
  const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', id).single();
  if (orderErr || !order) return res.status(404).json({ error: 'Order not found' });
  if (![order.client_id, order.freelancer_id].includes(profile.id))
    return res.status(403).json({ error: 'Not your order' });

  const { data: ordersData, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);
  const ordersArray = ordersData as Order[] | null;
  if (error || !ordersArray || ordersArray.length === 0) {
    return res.status(500).json({ error: error?.message || 'Failed to update order' });
  }
  res.json({ order: ordersArray[0] });
});

// --- messages ---

app.get('/api/messages/:orderId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const profile = req.profile!;
  const { orderId } = req.params;
  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (!order || ![order.client_id, order.freelancer_id].includes(profile.id)) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles(*)')
    .eq('order_id', orderId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ messages: data });
});

app.post('/api/messages/:orderId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const profile = req.profile!;
  const { orderId } = req.params;
  const { content } = req.body;
  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (!order || ![order.client_id, order.freelancer_id].includes(profile.id)) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const receiver_id = order.client_id === profile.id ? order.freelancer_id : order.client_id;
  const { data: messagesData, error } = await supabase
    .from('messages')
    .insert({
      order_id: orderId,
      sender_id: profile.id,
      receiver_id,
      content,
    });
  const messagesArray = messagesData as Message[] | null;
  if (error || !messagesArray || messagesArray.length === 0) {
    return res.status(500).json({ error: error?.message || 'Failed to send message' });
  }
  res.json({ data: messagesArray[0] });
});

// --- reviews ---

app.post('/api/reviews', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const profile = req.profile!;
  const { order_id, rating, comment } = req.body;
  const { data: order } = await supabase.from('orders').select('*').eq('id', order_id).single();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.client_id !== profile.id) return res.status(403).json({ error: 'Only client can review' });
  if (order.status !== 'completed') return res.status(400).json({ error: 'Order not completed' });

  const { data: reviewsData, error } = await supabase
    .from('reviews')
    .insert({
      order_id,
      gig_id: order.gig_id,
      client_id: profile.id,
      freelancer_id: order.freelancer_id,
      rating,
      comment,
    });
  const reviewsArray = reviewsData as Review[] | null;
  if (error || !reviewsArray || reviewsArray.length === 0) {
    return res.status(500).json({ error: error?.message || 'Failed to create review' });
  }
  res.json({ review: reviewsArray[0] });
});

// --- profiles ---

app.get('/api/profiles/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Profile not found' });
  res.json({ profile: data });
});

app.put('/api/profiles/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const profile = req.profile!;
  const updates = req.body;
  const { data: profilesData, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profile.id);
  const profilesArray = profilesData as Profile[] | null;
  if (error || !profilesArray || profilesArray.length === 0) {
    return res.status(500).json({ error: error?.message || 'Failed to update profile' });
  }
  res.json({ profile: profilesArray[0] });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
