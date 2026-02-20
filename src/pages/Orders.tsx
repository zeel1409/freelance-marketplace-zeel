import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, Order } from '../lib/api';
import { Package, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

interface OrdersProps {
  onMessageClick: (orderId: string) => void;
}

export default function Orders({ onMessageClick }: OrdersProps) {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'delivered' | 'completed'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { orders: data } = await ordersApi.list();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    try {
      await ordersApi.updateStatus(orderId, status);
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      alert(err instanceof Error ? err.message : 'Failed to update order');
    }
    setActionLoading(null);
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600">
            {profile?.role === 'client' ? 'Track your purchases' : 'Manage your client orders'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'pending', 'in_progress', 'delivered', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${filter === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.gigs?.title || 'Gig'}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize ml-1">{order.status.replace('_', ' ')}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{profile?.role === 'client' ? 'Freelancer' : 'Client'}:</span>{' '}
                        {profile?.role === 'client' ? order.freelancer?.full_name : order.client?.full_name}
                      </div>
                      <div><span className="font-medium">Price:</span> ${(order.price / 100).toFixed(2)}</div>
                      <div><span className="font-medium">Ordered:</span> {new Date(order.created_at).toLocaleDateString()}</div>
                      {order.delivery_date && (
                        <div><span className="font-medium">Delivery:</span> {new Date(order.delivery_date).toLocaleDateString()}</div>
                      )}
                    </div>

                    {order.requirements && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600"><span className="font-medium">Requirements:</span> {order.requirements}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onMessageClick(order.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </button>

                  {profile?.role === 'freelancer' && order.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(order.id, 'in_progress')}
                      disabled={actionLoading === order.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Accept Order
                    </button>
                  )}

                  {profile?.role === 'freelancer' && order.status === 'in_progress' && (
                    <button
                      onClick={() => updateStatus(order.id, 'delivered')}
                      disabled={actionLoading === order.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Mark as Delivered
                    </button>
                  )}

                  {profile?.role === 'client' && order.status === 'delivered' && (
                    <button
                      onClick={() => updateStatus(order.id, 'completed')}
                      disabled={actionLoading === order.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Mark as Completed
                    </button>
                  )}

                  {(order.status === 'pending' || order.status === 'in_progress') && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this order?')) {
                          updateStatus(order.id, 'cancelled');
                        }
                      }}
                      disabled={actionLoading === order.id}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
