import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/adminApi';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('[AdminOrders Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-light text-ink-900">Order Management</h1>
        <p className="mt-1 text-sm text-ink-500">Monitor customer orders and update delivery status</p>
      </div>

      <div className="rounded-token-lg border border-ink-100 bg-sand-50 overflow-hidden shadow-soft">
        {loading ? (
          <p className="p-6 text-sm text-ink-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-sm text-ink-500">No orders found.</p>
        ) : (
          <div className="divide-y divide-ink-100">
            {orders.map((order) => (
              <div key={order.id} className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 pb-3">
                  <div>
                    <span className="font-display text-lg font-medium text-ink-900">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <p className="text-xs text-ink-500">
                      Customer: {order.email} • Date: {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-ink-900">{formatPrice(Number(order.total))}</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold uppercase text-ink-600">Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="rounded-token border border-ink-200 bg-sand-50 px-3 py-1.5 text-xs font-medium text-ink-900 capitalize"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-token border border-ink-100 bg-sand-100/50 p-2.5">
                      <img src={item.image} alt={item.name} className="h-12 w-10 rounded-token object-cover bg-sand-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink-900 truncate">{item.name}</p>
                        <p className="text-xs text-ink-500">Size: {item.size} × Qty: {item.qty}</p>
                        <p className="text-xs font-semibold text-ink-900">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                {order.shipping_address && (
                  <div className="text-xs text-ink-600 bg-sand-100/30 p-3 rounded-token border border-ink-100">
                    <p className="font-semibold text-ink-900">Ship To:</p>
                    <p>
                      {order.shipping_address.full_name} — {order.shipping_address.address_line1},{' '}
                      {order.shipping_address.city}, {order.shipping_address.state}{' '}
                      {order.shipping_address.postal_code}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
