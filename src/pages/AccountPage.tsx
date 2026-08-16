import { useEffect, useState } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Heart, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { orderApi } from '@/lib/api/orderApi';
import { wishlistApi } from '@/lib/api/wishlistApi';
import { userApi } from '@/lib/api/userApi';
import type { Order, Product, Profile } from '@/types';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState, Skeleton } from '@/components/ui/States';

const tabs = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'profile', label: 'Profile', icon: UserIcon },
] as const;

export function AccountPage() {
  const { user, profile, signOut, fetchProfile } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as string) ?? 'orders';
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState<Profile | null>(profile);
  const [savingProfile, setSavingProfile] = useState(false);

  const wishlistIds = useWishlistStore((s) => s.productIds);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const [ordersData, wishData] = await Promise.all([
          orderApi.getOrders(),
          wishlistApi.getWishlist(),
        ]);
        setOrders(ordersData);
        setWishlistProducts(wishData.products || []);
      } catch (err) {
        console.error('[AccountPage Fetch Error]:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, wishlistIds.length]);

  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  if (!user) {
    return <Navigate to="/auth?redirect=account" replace />;
  }

  const setTab = (tab: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profileForm) return;
    setSavingProfile(true);
    try {
      await userApi.updateProfile({
        full_name: profileForm.full_name,
        phone: profileForm.phone,
      });
      await fetchProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="pt-16 lg:pt-20">
      <div className="border-b border-ink-100 bg-sand-100">
        <div className="container-page py-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-clay-600">My Account</p>
                <h1 className="font-display text-3xl font-light text-ink-900 sm:text-4xl">
                  Hello, {profile?.full_name || user.name || user.email?.split('@')[0] || 'there'}
                </h1>
              </div>
              {user.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Shield size={16} /> Admin Portal
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 hidden sm:block">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-token px-4 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.id ? 'bg-ink-900 text-sand-50' : 'text-ink-600 hover:bg-ink-100'
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-token px-4 py-3 text-sm font-medium text-ink-600 hover:bg-error-500/10 hover:text-error-600 transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Mobile tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto hide-scrollbar sm:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors',
                  activeTab === tab.id ? 'bg-ink-900 text-sand-50' : 'bg-ink-100 text-ink-600'
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'orders' && (
              <div>
                <h2 className="mb-6 font-display text-2xl font-light text-ink-900">Order History</h2>
                {loading ? (
                  <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-token-lg" />)}</div>
                ) : orders.length === 0 ? (
                  <EmptyState
                    icon={<Package size={32} />}
                    title="No orders yet"
                    description="When you place your first order, it will appear here."
                    action={<Link to="/shop"><Button variant="primary">Start Shopping</Button></Link>}
                  />
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-token-lg border border-ink-100 bg-sand-50 p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-3">
                          <div>
                            <p className="text-sm font-semibold text-ink-900">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-ink-500">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium capitalize text-sage-700">{order.status}</span>
                            <span className="text-sm font-semibold text-ink-900">{formatPrice(Number(order.total))}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <img src={item.image} alt={item.name} className="h-14 w-12 rounded-token object-cover bg-sand-200" />
                              <div>
                                <p className="text-xs font-medium text-ink-900">{item.name}</p>
                                <p className="text-xs text-ink-500">{item.size} × {item.qty}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="mb-6 font-display text-2xl font-light text-ink-900">My Wishlist</h2>
                {loading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full rounded-token-lg" />)}</div>
                ) : wishlistProducts.length === 0 ? (
                  <EmptyState
                    icon={<Heart size={32} />}
                    title="Your wishlist is empty"
                    description="Save products you love by tapping the heart icon."
                    action={<Link to="/shop"><Button variant="primary">Browse Products</Button></Link>}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3">
                    {wishlistProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-md">
                <h2 className="mb-6 font-display text-2xl font-light text-ink-900">Profile Information</h2>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <Input
                    label="Email"
                    value={user.email ?? ''}
                    disabled
                    className="opacity-60"
                  />
                  <Input
                    label="Full Name"
                    value={profileForm?.full_name ?? ''}
                    onChange={(e) => setProfileForm({ ...(profileForm as Profile), full_name: e.target.value })}
                    placeholder="Jane Doe"
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={profileForm?.phone ?? ''}
                    onChange={(e) => setProfileForm({ ...(profileForm as Profile), phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                  <Button type="submit" variant="primary" loading={savingProfile}>
                    Save Changes
                  </Button>
                </form>
                <div className="mt-8 border-t border-ink-100 pt-6">
                  <button onClick={signOut} className="flex items-center gap-2 text-sm font-medium text-error-600 hover:text-error-500 transition-colors">
                    <LogOut size={16} /> Sign out of your account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
