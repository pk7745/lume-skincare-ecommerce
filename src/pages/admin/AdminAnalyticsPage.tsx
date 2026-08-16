import { useEffect, useState } from 'react';
import {
  adminApi,
  type InventoryAnalytics,
  type CategoryAnalyticsItem,
  type CustomerAnalyticsMetrics,
  type ProductAnalyticsDetail,
} from '@/lib/api/adminApi';
import { productApi } from '@/lib/api/productApi';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/States';

export function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'categories' | 'customers' | 'trending' | 'product'>(
    'inventory'
  );
  const [inventory, setInventory] = useState<InventoryAnalytics | null>(null);
  const [categories, setCategories] = useState<CategoryAnalyticsItem[]>([]);
  const [customers, setCustomers] = useState<CustomerAnalyticsMetrics | null>(null);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productDetail, setProductDetail] = useState<{ product: Product; analytics: ProductAnalyticsDetail } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [invRes, catRes, custRes, trendRes, prodsRes] = await Promise.all([
          adminApi.getInventoryAnalytics(),
          adminApi.getCategoryAnalytics(),
          adminApi.getCustomerAnalytics(),
          productApi.getTrending(10),
          productApi.getProducts({ limit: 100 }),
        ]);
        setInventory(invRes);
        setCategories(catRes);
        setCustomers(custRes);
        setTrendingProducts(trendRes);
        setProductsList(prodsRes);
        if (prodsRes.length > 0) {
          setSelectedProductId(prodsRes[0].id);
        }
      } catch (err) {
        console.error('[AdminAnalytics Load Error]:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;
    adminApi
      .getSingleProductAnalytics(selectedProductId)
      .then(setProductDetail)
      .catch((err) => console.error('[Product Analytics Error]:', err));
  }, [selectedProductId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-token-lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'inventory', label: 'Inventory Health' },
    { id: 'categories', label: 'Categories' },
    { id: 'customers', label: 'Customers' },
    { id: 'trending', label: 'Trending Scores' },
    { id: 'product', label: 'Product Performance' },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light text-ink-900">Advanced Analytics</h1>
        <p className="mt-1 text-sm text-ink-500">Real-time database insights, inventory valuation, and product metrics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-ink-100 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`rounded-token px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === t.id ? 'bg-ink-900 text-sand-50' : 'text-ink-600 hover:bg-ink-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. Inventory */}
      {activeTab === 'inventory' && inventory && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-5">
              <span className="text-xs font-medium uppercase text-ink-500">Total Valuation</span>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900">
                {formatPrice(inventory.summary.totalValuation)}
              </p>
            </div>
            <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-5">
              <span className="text-xs font-medium uppercase text-sage-600">Healthy Stock</span>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{inventory.summary.healthyCount}</p>
            </div>
            <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-5">
              <span className="text-xs font-medium uppercase text-warning-600">Low Stock (≤ 5 units)</span>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{inventory.summary.lowStockCount}</p>
            </div>
            <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-5">
              <span className="text-xs font-medium uppercase text-error-600">Out of Stock</span>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{inventory.summary.outOfStockCount}</p>
            </div>
          </div>

          <div className="rounded-token-lg border border-ink-100 bg-sand-50 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-sand-100 text-xs font-semibold uppercase text-ink-700">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {inventory.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4 font-medium text-ink-900">{item.name}</td>
                    <td className="p-4 text-ink-600">{item.category}</td>
                    <td className="p-4 font-semibold text-ink-900">{formatPrice(item.price)}</td>
                    <td className="p-4 text-ink-900">{item.stock}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                          item.status === 'out_of_stock'
                            ? 'bg-error-500/10 text-error-600'
                            : item.status === 'low_stock'
                            ? 'bg-warning-500/10 text-warning-600'
                            : 'bg-sage-100 text-sage-700'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Categories */}
      {activeTab === 'categories' && (
        <div className="rounded-token-lg border border-ink-100 bg-sand-50 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-sand-100 text-xs font-semibold uppercase text-ink-700">
              <tr>
                <th className="p-4">Category</th>
                <th className="p-4">Active Products</th>
                <th className="p-4">Units Sold</th>
                <th className="p-4">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-medium text-ink-900">{c.name}</td>
                  <td className="p-4 text-ink-600">{c.productCount}</td>
                  <td className="p-4 text-ink-900">{c.unitsSold}</td>
                  <td className="p-4 font-semibold text-ink-900">{formatPrice(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Customers */}
      {activeTab === 'customers' && customers && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6">
            <span className="text-xs font-medium uppercase text-ink-500">Total Customers</span>
            <p className="mt-2 font-display text-3xl font-semibold text-ink-900">{customers.totalCustomers}</p>
          </div>
          <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6">
            <span className="text-xs font-medium uppercase text-sage-600">New (Last 30 Days)</span>
            <p className="mt-2 font-display text-3xl font-semibold text-ink-900">{customers.newCustomers}</p>
          </div>
          <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6">
            <span className="text-xs font-medium uppercase text-clay-600">Returning Customers</span>
            <p className="mt-2 font-display text-3xl font-semibold text-ink-900">{customers.returningCustomers}</p>
          </div>
          <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6">
            <span className="text-xs font-medium uppercase text-ink-500">Avg Orders / Customer</span>
            <p className="mt-2 font-display text-3xl font-semibold text-ink-900">{customers.avgOrdersPerCustomer}</p>
          </div>
          <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6 sm:col-span-2 lg:col-span-2">
            <span className="text-xs font-medium uppercase text-ink-500">Avg Customer Lifetime Value</span>
            <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
              {formatPrice(customers.avgCustomerLifetimeValue)}
            </p>
          </div>
        </div>
      )}

      {/* 4. Trending */}
      {activeTab === 'trending' && (
        <div className="rounded-token-lg border border-ink-100 bg-sand-50 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-sand-100 text-xs font-semibold uppercase text-ink-700">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Normalized Trending Score</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {trendingProducts.map((p) => (
                <tr key={p.id}>
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="h-10 w-8 rounded object-cover bg-sand-200" />
                    <span className="font-medium text-ink-900">{p.name}</span>
                  </td>
                  <td className="p-4 font-semibold text-clay-600">
                    {((p as any).trendingScore || 0.5).toFixed(2)} / 1.00
                  </td>
                  <td className="p-4 font-medium text-ink-900">{formatPrice(Number(p.price))}</td>
                  <td className="p-4 text-ink-900">{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Product Performance */}
      {activeTab === 'product' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase text-ink-600">Select Product:</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="rounded-token border border-ink-200 bg-sand-50 px-4 py-2 text-sm text-ink-900"
            >
              {productsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {productDetail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-4">
                  <span className="text-xs text-ink-500 uppercase">Product Views</span>
                  <p className="mt-1 text-2xl font-semibold text-ink-900">{productDetail.analytics.views}</p>
                </div>
                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-4">
                  <span className="text-xs text-ink-500 uppercase">Cart Additions</span>
                  <p className="mt-1 text-2xl font-semibold text-ink-900">{productDetail.analytics.cartAdds}</p>
                </div>
                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-4">
                  <span className="text-xs text-ink-500 uppercase">Units Sold</span>
                  <p className="mt-1 text-2xl font-semibold text-ink-900">{productDetail.analytics.unitsSold}</p>
                </div>
                <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-4">
                  <span className="text-xs text-ink-500 uppercase">Total Revenue</span>
                  <p className="mt-1 text-2xl font-semibold text-ink-900">
                    {formatPrice(productDetail.analytics.revenue)}
                  </p>
                </div>
              </div>

              <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6">
                <h4 className="mb-4 font-display text-lg text-ink-900">Historical Sales Trend</h4>
                {productDetail.analytics.historicalSales.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-500">Not enough historical data yet.</p>
                ) : (
                  <div className="divide-y divide-ink-100">
                    {productDetail.analytics.historicalSales.map((h, i) => (
                      <div key={i} className="flex justify-between py-2.5 text-sm">
                        <span className="text-ink-600">{h.date}</span>
                        <span className="font-medium text-ink-900">
                          {h.units} units — {formatPrice(h.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
