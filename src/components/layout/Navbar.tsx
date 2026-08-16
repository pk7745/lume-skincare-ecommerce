import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useCartStore, selectCartCount } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Shop All', to: '/shop' },
  { label: 'Cleansers', to: '/shop?category=cleansers' },
  { label: 'Serums', to: '/shop?category=serums' },
  { label: 'Moisturizers', to: '/shop?category=moisturizers' },
  { label: 'Sun Protection', to: '/shop?category=sun-protection' },
];

export function Navbar({ onSearchOpen }: { onSearchOpen: () => void }) {
  const cartCount = useCartStore(selectCartCount);
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const user = useAuthStore((s) => s.user);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-sand-50/90 backdrop-blur-lg shadow-soft border-b border-ink-100'
            : 'bg-transparent'
        )}
      >
        <nav className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-ink-900 hover:text-clay-600 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 lg:gap-3">
            <span className="font-display text-2xl font-medium tracking-tight text-ink-900">
              LUMÉ
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-xs font-medium uppercase tracking-wider text-ink-700 hover:text-clay-600 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-clay-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onSearchOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 hover:text-ink-900 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link
              to="/account"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 hover:text-ink-900 transition-colors"
              aria-label="Account"
            >
              <User size={20} />
            </Link>

            <Link
              to="/account?tab=wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 hover:text-ink-900 transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay-500 px-1 text-[10px] font-bold text-sand-50">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 hover:text-ink-900 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-900 px-1 text-[10px] font-bold text-sand-50">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-ink-900/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 z-[70] w-80 max-w-[85vw] bg-sand-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-ink-100">
                <span className="font-display text-xl text-ink-900">LUMÉ</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={22} className="text-ink-700" />
                </button>
              </div>
              <div className="flex flex-col gap-1 p-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="rounded-token px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/account"
                  className="rounded-token px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                >
                  My Account
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
