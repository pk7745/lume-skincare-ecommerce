import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, ShoppingBag, Heart, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { adminApi, type ProductAnalyticsDetail } from '@/lib/api/adminApi';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/States';

export function AdminProductPerformancePage() {
  const { id } = useParams<{ id: string }>();
  const [productData, setProductData] = useState<{ product: Product; analytics: ProductAnalyticsDetail } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    adminApi
      .getSingleProductAnalytics(id)
      .then((res) => {
        setProductData(res);
      })
      .catch((err) => {
        console.error('[AdminProductPerformance Error]:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-token-lg" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-token-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-lg font-medium text-ink-900">Product Analytics Not Found</p>
        <Link to="/admin/products" className="text-xs text-clay-600 hover:underline">
          ← Return to Product Catalog
        </Link>
      </div>
    );
  }

  const { product, analytics } = productData;
  const maxRevenue = Math.max(...analytics.historicalSales.map((h) => h.revenue), 10);
  const chartHeight = 160;
  const chartWidth = 600;
  const points = analytics.historicalSales
    .map((d, i) => {
      const x = (i / Math.max(analytics.historicalSales.length - 1, 1)) * chartWidth;
      const y = chartHeight - (d.revenue / maxRevenue) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/admin/products"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-16 w-14 rounded-token bg-sand-200 object-cover"
            />
            <div>
              <h1 className="font-display text-2xl font-light text-ink-900 sm:text-3xl">{product.name}</h1>
              <p className="text-xs text-ink-500 capitalize">
                Category: {(product.category as any)?.name || 'Skincare'} • Price: {formatPrice(Number(product.price))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase ${
                product.stock === 0
                  ? 'bg-error-500/10 text-error-600'
                  : product.stock <= 5
                  ? 'bg-warning-500/10 text-warning-600'
                  : 'bg-sage-100 text-sage-700'
              }`}
            >
              {product.stock === 0 ? (
                <AlertCircle size={14} />
              ) : (
                <CheckCircle size={14} />
              )}
              {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Low Stock (${product.stock})` : `Healthy (${product.stock} units)`}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-4 shadow-soft">
          <span className="text-xs font-medium uppercase text-ink-500 flex items-center gap-1">
            <Eye size={14} className="text-ink-400" /> Views
          </span>
          <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{analytics.views}</p>
        </div>
        <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-4 shadow-soft">
          <span className="text-xs font-medium uppercase text-ink-500 flex items-center gap-1">
            <ShoppingBag size={14} className="text-ink-400" /> Cart Adds
          </span>
          <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{analytics.cartAdds}</p>
        </div>
        <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-4 shadow-soft">
          <span className="text-xs font-medium uppercase text-ink-500 flex items-center gap-1">
            <Heart size={14} className="text-ink-400" /> Wishlist Adds
          </span>
          <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{analytics.wishlistAdds}</p>
        </div>
        <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-4 shadow-soft">
          <span className="text-xs font-medium uppercase text-ink-500 flex items-center gap-1">
            <ShoppingBag size={14} className="text-clay-600" /> Units Sold
          </span>
          <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{analytics.unitsSold}</p>
        </div>
        <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-4 shadow-soft">
          <span className="text-xs font-medium uppercase text-ink-500 flex items-center gap-1">
            <DollarSign size={14} className="text-sage-600" /> Revenue
          </span>
          <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{formatPrice(analytics.revenue)}</p>
        </div>
        <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-4 shadow-soft">
          <span className="text-xs font-medium uppercase text-ink-500 flex items-center gap-1">
            <TrendingUp size={14} className="text-clay-600" /> Conversion Rate
          </span>
          <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{analytics.conversionRate}%</p>
        </div>
      </div>

      {/* Historical Sales Trend Chart */}
      <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-3">
          <div>
            <h3 className="font-display text-xl text-ink-900">Historical Sales Trend</h3>
            <p className="text-xs text-ink-500">Revenue generated by this formula over time</p>
          </div>
          <span className="rounded-full bg-clay-50 px-3 py-1 text-xs font-semibold text-clay-600">
            {analytics.demandLevel}
          </span>
        </div>

        {analytics.historicalSales.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-500">Not enough historical sales data yet for this formula.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-40 overflow-visible">
                {[0, 0.33, 0.66, 1].map((pct, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={chartHeight * pct}
                    x2={chartWidth}
                    y2={chartHeight * pct}
                    stroke="#E2DED9"
                    strokeDasharray="4 4"
                  />
                ))}
                <polyline fill="none" stroke="#8C6D58" strokeWidth="2.5" points={points} />
                {analytics.historicalSales.map((d, i) => {
                  const x = (i / Math.max(analytics.historicalSales.length - 1, 1)) * chartWidth;
                  const y = chartHeight - (d.revenue / maxRevenue) * chartHeight;
                  return (
                    <circle key={i} cx={x} cy={y} r="4" className="fill-clay-600 stroke-sand-50 stroke-2" />
                  );
                })}
              </svg>
              <div className="mt-4 flex justify-between text-[10px] text-ink-500 uppercase tracking-wider">
                {analytics.historicalSales.map((d, i) => (
                  <span key={i}>{d.date.slice(5)}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
