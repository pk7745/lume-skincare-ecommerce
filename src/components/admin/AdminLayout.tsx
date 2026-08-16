import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Package, ShoppingBag, MessageSquare, ArrowLeft, RefreshCw, Database } from 'lucide-react';
import { adminApi } from '@/lib/api/adminApi';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Reviews', to: '/admin/reviews', icon: MessageSquare },
];

export function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [reseeding, setReseeding] = useState(false);

  const handleReseed = async () => {
    setReseeding(true);
    try {
      const res = await adminApi.reseedDemoData();
      alert(`Demo data reseeded cleanly!\n• Customers: ${res.counts.demoCustomers}\n• Orders: ${res.counts.demoOrders}\n• Events: ${res.counts.demoEvents}`);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to reseed demo data');
    } finally {
      setReseeding(false);
    }
  };

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-sand-100 flex flex-col sm:flex-row">
      {/* Sidebar */}
      <aside className="w-full sm:w-64 bg-sand-50 border-r border-ink-100 p-6 shrink-0 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <Link to="/" className="flex items-center gap-2 text-xs text-ink-500 hover:text-ink-900 transition-colors mb-3">
              <ArrowLeft size={14} /> Back to Storefront
            </Link>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-light text-ink-900">LUMÉ Admin</h2>
            </div>
            <p className="text-xs text-clay-600 font-medium uppercase tracking-wider mt-1">Management Portal</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-token px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-ink-900 text-sand-50 shadow-soft'
                      : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Demo Mode Badge & Reseed Button */}
        <div className="mt-8 border-t border-ink-100 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-clay-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-clay-600 uppercase">
              <Database size={10} /> Demo Data Store
            </span>
          </div>
          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="flex w-full items-center justify-center gap-2 rounded-token border border-ink-200 bg-sand-50 py-2 text-xs font-medium text-ink-700 hover:border-ink-900 hover:bg-ink-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={cn(reseeding && 'animate-spin')} />
            {reseeding ? 'Reseeding...' : 'Refresh Demo Data'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
