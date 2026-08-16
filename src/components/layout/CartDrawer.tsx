import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore, getCartTotals } from '@/stores/cartStore';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);
  const applyPromo = useCartStore((s) => s.applyPromo);
  const removePromo = useCartStore((s) => s.removePromo);

  const totals = getCartTotals(items, promoDiscount);
  const { subtotal, discount } = totals;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-ink-900/40 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-[90] flex w-full max-w-md flex-col bg-sand-50 shadow-soft-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-ink-900" />
                <h2 className="font-display text-xl font-light text-ink-900">Your Bag</h2>
                <span className="text-xs text-ink-500">({items.reduce((s, i) => s + i.qty, 0)})</span>
              </div>
              <button
                onClick={closeCart}
                className="text-ink-400 hover:text-ink-900 transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <ShoppingBag size={48} className="text-ink-200" />
                <p className="mt-4 font-display text-lg text-ink-900">Your bag is empty</p>
                <p className="mt-1 text-xs text-ink-500">
                  Discover our curated skincare essentials and start your ritual.
                </p>
                <Button variant="primary" className="mt-6" onClick={closeCart}>
                  Explore Products
                </Button>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-ink-100">
                  {items.map((item) => (
                    <div key={`${item.product_id}-${item.size}`} className="flex gap-4 py-4">
                      <Link to={`/product/${item.slug}`} onClick={closeCart}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-16 rounded-token object-cover bg-sand-100"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between">
                            <Link
                              to={`/product/${item.slug}`}
                              onClick={closeCart}
                              className="text-sm font-medium text-ink-900 hover:text-clay-600 transition-colors"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.product_id, item.size)}
                              className="text-ink-400 hover:text-error-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-ink-500">{item.size}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center rounded-token border border-ink-200">
                            <button
                              onClick={() => updateQty(item.product_id, item.size, item.qty - 1)}
                              className="flex h-7 w-7 items-center justify-center text-ink-600 hover:text-ink-900 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-medium text-ink-900">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.product_id, item.size, item.qty + 1)}
                              disabled={item.qty >= item.stock}
                              className="flex h-7 w-7 items-center justify-center text-ink-600 hover:text-ink-900 transition-colors disabled:opacity-30"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-ink-900">
                            {formatPrice(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="border-t border-ink-100 px-6 py-3">
                  {promoCode ? (
                    <div className="flex items-center justify-between rounded-token bg-sage-50 px-3 py-2">
                      <span className="text-xs font-medium text-sage-700">
                        Code "{promoCode}" applied — {discount > 0 ? `${Math.round((discount / subtotal) * 100)}% off` : ''}
                      </span>
                      <button
                        onClick={removePromo}
                        className="text-xs text-ink-500 hover:text-error-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form
                      className="flex gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const input = (e.currentTarget.elements.namedItem('promo') as HTMLInputElement);
                        if (input && input.value) {
                          const success = await applyPromo(input.value);
                          if (success) {
                            input.value = '';
                          }
                        }
                      }}
                    >
                      <input
                        name="promo"
                        type="text"
                        placeholder="Promo code (try WELCOME10)"
                        className="h-10 flex-1 rounded-token border border-ink-200 bg-white px-3 text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-ink-900"
                      />
                      <button
                        type="submit"
                        className="h-10 rounded-token border border-ink-300 px-4 text-xs font-medium uppercase tracking-wide text-ink-700 hover:bg-ink-100 transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>

                {/* Summary */}
                <div className="border-t border-ink-100 px-6 py-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-ink-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-clay-600">
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-ink-600">
                      <span>Shipping</span>
                      <span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-ink-600">
                      <span>Tax (est.)</span>
                      <span>{formatPrice(totals.tax)}</span>
                    </div>
                    <div className={cn('flex justify-between border-t border-ink-100 pt-2 mt-2 text-base font-semibold text-ink-900')}>
                      <span>Total</span>
                      <span>{formatPrice(totals.total)}</span>
                    </div>
                  </div>
                  {subtotal < 75 && subtotal > 0 && (
                    <p className="mt-3 text-center text-xs text-ink-500">
                      Add {formatPrice(75 - subtotal)} more for free shipping
                    </p>
                  )}
                  <Link to="/checkout" onClick={closeCart} className="mt-4 block">
                    <Button variant="primary" className="w-full" size="lg">
                      Checkout
                    </Button>
                  </Link>
                  <button
                    onClick={closeCart}
                    className="mt-2 w-full text-center text-xs font-medium uppercase tracking-wide text-ink-500 hover:text-ink-900 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
