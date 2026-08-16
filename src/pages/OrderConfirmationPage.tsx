import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function OrderConfirmationPage() {
  return (
    <div className="pt-16 lg:pt-20 flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="container-page max-w-lg text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
          <CheckCircle2 size={36} className="text-sage-600" />
        </div>
        <h1 className="font-display text-3xl font-light text-ink-900 sm:text-4xl">
          Thank you for your order
        </h1>
        <p className="mt-4 text-base text-ink-600">
          Your order has been placed successfully. A confirmation email will arrive shortly with your order details and tracking information.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/shop"><Button variant="primary" size="lg">Continue Shopping</Button></Link>
          <Link to="/account?tab=orders"><Button variant="outline" size="lg">View Orders</Button></Link>
        </div>
      </motion.div>
    </div>
  );
}
