import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CreditCard, Check } from 'lucide-react';
import { useCartStore, getCartTotals } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { orderApi } from '@/lib/api/orderApi';
import { paymentApi } from '@/lib/api/paymentApi';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/States';

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const totals = getCartTotals(items, promoDiscount);

  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipping, setShipping] = useState({
    full_name: user?.name || user?.email?.split('@')[0] || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    phone: '',
  });

  if (items.length === 0) {
    return (
      <div className="pt-20 container-page">
        <EmptyState
          icon={<CreditCard size={32} />}
          title="Your bag is empty"
          description="Add items to your bag before checking out."
          action={
            <Link to="/shop">
              <Button variant="primary">Browse Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth?redirect=checkout');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on backend REST API
      const order = await orderApi.createOrder({
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image,
          size: i.size,
        })),
        shipping_address: shipping,
        promoCode: promoCode || undefined,
      });

      // 2. Initialize Payment Session (Mock or Stripe)
      const paymentRes = await paymentApi.createCheckoutSession(order.id);

      await clearCart();

      if (paymentRes.mode === 'stripe' && paymentRes.url) {
        window.location.href = paymentRes.url;
      } else {
        navigate('/order-confirmation', { state: { order: paymentRes.order || order } });
      }
    } catch (err: any) {
      setError(err.message || 'Unable to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 lg:pt-20">
      <div className="container-page py-8">
        <h1 className="mb-2 font-display text-3xl font-light text-ink-900 sm:text-4xl">Checkout</h1>

        {/* Steps indicator */}
        <div className="mb-8 flex items-center gap-4 text-xs font-medium uppercase tracking-wider">
          {(['shipping', 'payment', 'review'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={step === s ? 'text-ink-900' : step > s ? 'text-sage-600' : 'text-ink-300'}>
                {step > s ? (
                  <Check size={16} />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current">
                    {i + 1}
                  </span>
                )}
              </span>
              <span className={step === s ? 'text-ink-900' : 'text-ink-400'}>{s}</span>
              {i < 2 && <span className="text-ink-200">—</span>}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <div>
            {step === 'shipping' && (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleShippingSubmit}
                className="space-y-4"
              >
                <h2 className="font-display text-xl text-ink-900">Shipping Information</h2>
                <Input
                  label="Full Name"
                  name="full_name"
                  value={shipping.full_name}
                  onChange={(e) => setShipping({ ...shipping, full_name: e.target.value })}
                  required
                />
                <Input
                  label="Address Line 1"
                  name="address_line1"
                  value={shipping.address_line1}
                  onChange={(e) => setShipping({ ...shipping, address_line1: e.target.value })}
                  required
                />
                <Input
                  label="Address Line 2 (Optional)"
                  name="address_line2"
                  value={shipping.address_line2}
                  onChange={(e) => setShipping({ ...shipping, address_line2: e.target.value })}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="City"
                    name="city"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    required
                  />
                  <Input
                    label="State / Province"
                    name="state"
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Postal Code"
                    name="postal_code"
                    value={shipping.postal_code}
                    onChange={(e) => setShipping({ ...shipping, postal_code: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="mt-4">
                  Continue to Payment
                </Button>
              </motion.form>
            )}

            {step === 'payment' && (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handlePaymentSubmit}
                className="space-y-4"
              >
                <h2 className="font-display text-xl text-ink-900">Payment Method</h2>
                {!user && (
                  <div className="rounded-token border border-clay-200 bg-clay-50 p-4">
                    <p className="text-sm text-clay-700">
                      You'll need to sign in to complete your order.{' '}
                      <Link to="/auth?redirect=checkout" className="font-medium underline underline-offset-2">
                        Sign in or create an account
                      </Link>
                    </p>
                  </div>
                )}
                <div className="rounded-token border border-ink-200 bg-sand-50 p-6">
                  <div className="mb-4 flex items-center gap-2 text-sm font-medium text-ink-900">
                    <CreditCard size={18} /> Mock / Stripe Payment Integration
                  </div>
                  <div className="space-y-4">
                    <Input label="Card Number" placeholder="4242 4242 4242 4242" defaultValue="4242424242424242" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Expiry" placeholder="MM/YY" defaultValue="12/28" />
                      <Input label="CVC" placeholder="123" defaultValue="123" />
                    </div>
                  </div>
                </div>
                {error && <p className="text-sm text-error-500">{error}</p>}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep('shipping')}>
                    Back
                  </Button>
                  <Button type="submit" variant="primary" size="lg" loading={loading}>
                    {user ? 'Place Order' : 'Sign in to Continue'}
                  </Button>
                </div>
              </motion.form>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-token-lg border border-ink-100 bg-sand-100 p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-900">Order Summary</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.product_id}-${item.size}`} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="h-16 w-14 rounded-token object-cover bg-sand-200" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-900">{item.name}</p>
                      <p className="text-xs text-ink-500">{item.size} × {item.qty}</p>
                      <p className="text-sm font-semibold text-ink-900">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5 border-t border-ink-100 pt-4 text-sm">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-clay-600">
                    <span>Discount ({promoCode})</span>
                    <span>-{formatPrice(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink-600">
                  <span>Shipping</span>
                  <span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Tax</span>
                  <span>{formatPrice(totals.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-ink-100 pt-2 text-base font-semibold text-ink-900">
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-500">
              <Lock size={14} /> Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
