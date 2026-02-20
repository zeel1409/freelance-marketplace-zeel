import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, messagesApi, Message, Order } from '../lib/api';
import { Send, MessageSquare } from 'lucide-react';

interface MessagesProps {
  selectedOrderId?: string;
}

export default function Messages({ selectedOrderId }: MessagesProps) {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load orders on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { orders: data } = await ordersApi.list();
        setOrders(data);
        if (selectedOrderId) {
          const found = data.find((o) => o.id === selectedOrderId);
          setSelectedOrder(found || data[0] || null);
        } else {
          setSelectedOrder(data[0] || null);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
      setLoading(false);
    };
    init();
  }, [selectedOrderId]);

  // Fetch messages + set up polling when order changes
  useEffect(() => {
    if (!selectedOrder) return;

    const fetchMessages = async () => {
      try {
        const { messages: data } = await messagesApi.list(selectedOrder.id);
        setMessages(data);
        scrollToBottom();
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    // Poll every 4 seconds for new messages
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedOrder]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedOrder) return;

    setSending(true);
    try {
      await messagesApi.send(selectedOrder.id, newMessage.trim());
      setNewMessage('');
      const { messages: data } = await messagesApi.list(selectedOrder.id);
      setMessages(data);
    } catch (err) {
      console.error('Error sending message:', err);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-md">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No orders yet. Messages will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversation list */}
          <div className="md:col-span-1 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition ${selectedOrder?.id === order.id ? 'bg-blue-50' : ''
                    }`}
                >
                  <div className="font-medium text-gray-900 mb-1 line-clamp-1">{order.gigs?.title || 'Order'}</div>
                  <div className="text-sm text-gray-600">
                    {profile?.id === order.client_id ? order.freelancer?.full_name : order.client?.full_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="md:col-span-2 flex flex-col bg-white">
            {selectedOrder ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedOrder.gigs?.title || 'Order'}</h2>
                  <p className="text-sm text-gray-600">
                    Chat with{' '}
                    {profile?.id === selectedOrder.client_id
                      ? selectedOrder.freelancer?.full_name
                      : selectedOrder.client?.full_name}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender_id === profile?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                            }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${message.sender_id === profile?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      title="Send message"
                      aria-label="Send message"
                      className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
