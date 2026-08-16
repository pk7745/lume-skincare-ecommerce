import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-24 bg-ink-900 text-sand-100">
      <div className="container-page py-16">
        {/* Newsletter */}
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="font-display text-3xl text-sand-50 sm:text-4xl">
            Join the ritual
          </h2>
          <p className="mt-3 max-w-md text-sm text-sand-300">
            Subscribe for early access to new launches, skincare education, and 10% off your first order.
          </p>
          <form
            className="mt-6 flex w-full max-w-md gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Email address"
              className="h-12 flex-1 rounded-token border border-ink-700 bg-ink-800 px-4 text-sm text-sand-50 placeholder:text-ink-400 focus:outline-none focus:border-sand-300"
            />
            <button
              type="submit"
              className="h-12 rounded-token bg-sand-50 px-6 text-xs font-semibold uppercase tracking-wider text-ink-900 hover:bg-sand-200 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-8 border-t border-ink-700 pt-12 sm:grid-cols-4">
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-sand-400">
              Shop
            </h4>
            <ul className="space-y-3">
              <li><Link to="/shop" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=cleansers" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Cleansers</Link></li>
              <li><Link to="/shop?category=serums" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Serums</Link></li>
              <li><Link to="/shop?category=moisturizers" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Moisturizers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-sand-400">
              Company
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Our Story</a></li>
              <li><a href="#" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Ingredients</a></li>
              <li><a href="#" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Sustainability</a></li>
              <li><a href="#" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Journal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-sand-400">
              Support
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Track Order</a></li>
              <li><a href="#" className="text-sm text-sand-200 hover:text-sand-50 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-sand-400">
              Connect
            </h4>
            <div className="flex gap-3">
              <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 hover:border-sand-300 hover:text-sand-50 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="Email" className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 hover:border-sand-300 hover:text-sand-50 transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-700 pt-8 sm:flex-row">
          <p className="text-xs text-ink-400">© 2026 LUMÉ. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-ink-400 hover:text-sand-200 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-ink-400 hover:text-sand-200 transition-colors">Terms</a>
            <a href="#" className="text-xs text-ink-400 hover:text-sand-200 transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
