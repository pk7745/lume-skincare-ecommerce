import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, AlertTriangle, Activity, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { adminApi, type AdminDashboardStats, type SalesAnalyticsItem, type ActivityItem } from '@/lib/api/adminApi';
import { formatPrice, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/States';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesAnalyticsItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [dashStats, salesRes, actRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getSalesAnalytics(range),
          adminApi.getRecentActivity(),
        ]);
        setStats(dashStats);
        setSalesData(salesRes);
        setActivities(actRes);
      } catch (err) {
        console.error('[AdminDashboard Load Error]:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRangeChange = async (newRange: '7d' | '30d' | '90d' | '12m') => {
    setRange(newRange);
    setSalesLoading(true);
    try {
      const data = await adminApi.getSalesAnalytics(newRange);
      setSalesData(data);
    } catch (err) {
      console.error('[Sales Analytics Error]:', err);
    } finally {
      setSalesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-token-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-token-lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.totalSales || 0),
      trend: stats?.trends.revenueTrendPct,
      icon: DollarSign,
      color: 'text-sage-600',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      trend: stats?.trends.ordersTrendPct,
      icon: ShoppingBag,
      color: 'text-clay-600',
    },
    {
      title: 'Average Order Value',
      value: formatPrice(stats?.aov || 0),
      trend: stats?.trends.aovTrendPct,
      icon: Users,
      color: 'text-ink-700',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockCount || 0,
      trend: undefined,
      icon: AlertTriangle,
      color: 'text-warning-600',
    },
  ];

  // SVG Chart Calculations
  const activeMetricValues = salesData.map((d) => (chartMetric === 'revenue' ? d.revenue : d.orders));
  const maxVal = Math.max(...activeMetricValues, 10);
  const chartHeight = 180;
  const chartWidth = 600;
  const points = salesData
    .map((d, i) => {
      const val = chartMetric === 'revenue' ? d.revenue : d.orders;
      const x = (i / Math.max(salesData.length - 1, 1)) * chartWidth;
      const y = chartHeight - (val / maxVal) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light text-ink-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-ink-500">Real-time store performance, revenue graphs, and stock alerts</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-token-lg border border-ink-100 bg-sand-50 p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-500">{card.title}</span>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="mt-3 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{card.value}</p>
            {card.trend !== undefined && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {card.trend >= 0 ? (
                  <span className="inline-flex items-center text-sage-700 font-medium">
                    <TrendingUp size={14} className="mr-0.5" /> +{card.trend}%
                  </span>
                ) : (
                  <span className="inline-flex items-center text-error-600 font-medium">
                    <TrendingDown size={14} className="mr-0.5" /> {card.trend}%
                  </span>
                )}
                <span className="text-ink-400">vs prev period</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Sales Line Graph */}
      <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6 shadow-soft">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 pb-4">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-display text-xl text-ink-900">
                {chartMetric === 'revenue' ? 'Revenue Analytics' : 'Order Volume Analytics'}
              </h3>
              <p className="text-xs text-ink-500">Real-time database aggregated trends</p>
            </div>
            <div className="flex rounded-token border border-ink-200 bg-sand-100 p-0.5">
              <button
                onClick={() => setChartMetric('revenue')}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  chartMetric === 'revenue' ? 'bg-sand-50 text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric('orders')}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  chartMetric === 'orders' ? 'bg-sand-50 text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                Orders (#)
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {(['7d', '30d', '90d', '12m'] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`rounded-token px-3 py-1 text-xs font-medium uppercase transition-colors ${
                  range === r
                    ? 'bg-ink-900 text-sand-50'
                    : 'border border-ink-200 text-ink-600 hover:bg-ink-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {salesLoading ? (
          <Skeleton className="h-48 w-full rounded-token" />
        ) : salesData.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-500">No data recorded for this range.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
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
                <polyline fill="none" stroke="#2B2927" strokeWidth="2.5" points={points} />
                {salesData.map((d, i) => {
                  const val = chartMetric === 'revenue' ? d.revenue : d.orders;
                  const x = (i / Math.max(salesData.length - 1, 1)) * chartWidth;
                  const y = chartHeight - (val / maxVal) * chartHeight;
                  return (
                    <circle key={i} cx={x} cy={y} r="4" className="fill-clay-500 stroke-sand-50 stroke-2" />
                  );
                })}
              </svg>
              <div className="mt-4 flex justify-between text-[10px] text-ink-500 uppercase tracking-wider">
                {salesData.map((d, i) => (
                  <span key={i}>{d.date.slice(5)}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Performing Formulas Section */}
      <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl text-ink-900">Top Performing Formulas</h3>
            <p className="text-xs text-ink-500">Ranked by MongoDB order volume and revenue generation</p>
          </div>
          <Link to="/admin/products" className="text-xs font-semibold text-clay-600 hover:underline">
            View Catalog →
          </Link>
        </div>

        <div className="divide-y divide-ink-100 overflow-x-auto">
          {stats?.topProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/admin/products/${p.id}/analytics`)}
              className="flex items-center justify-between py-3.5 hover:bg-sand-100/60 px-2 rounded-token cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <img src={p.image} alt={p.name} className="h-12 w-10 rounded object-cover bg-sand-200" />
                <div>
                  <p className="text-sm font-semibold text-ink-900 flex items-center gap-1 hover:text-clay-600 transition-colors">
                    {p.name} <ArrowUpRight size={14} className="text-ink-400" />
                  </p>
                  <p className="text-xs text-ink-500">
                    Category: {p.category} • Price: {formatPrice(p.price)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink-900">{formatPrice(p.revenue)}</p>
                <p className="text-xs text-ink-500">{p.unitsSold} units sold</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Recent Orders & Recent Activity */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6 shadow-soft">
          <h3 className="mb-4 font-display text-xl text-ink-900">Recent Orders</h3>
          <div className="divide-y divide-ink-100">
            {stats?.recentOrders.length === 0 ? (
              <p className="py-4 text-sm text-ink-500">No orders placed yet.</p>
            ) : (
              stats?.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-ink-500">{order.email} • {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink-900">{formatPrice(Number(order.total))}</p>
                    <span className="inline-block rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-medium capitalize text-sage-700">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-token-lg border border-ink-100 bg-sand-50 p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl text-ink-900">Store Activity</h3>
            <Activity size={18} className="text-clay-600" />
          </div>
          <div className="divide-y divide-ink-100">
            {activities.length === 0 ? (
              <p className="py-4 text-sm text-ink-500">No store activity logged.</p>
            ) : (
              activities.map((act, i) => (
                <div key={i} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{act.title}</p>
                    <p className="text-xs text-ink-500">{act.meta}</p>
                  </div>
                  <span className="text-[10px] text-ink-400 whitespace-nowrap">{formatDate(act.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
