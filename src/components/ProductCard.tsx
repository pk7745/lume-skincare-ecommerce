import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { useWishlistStore } from '@/stores/wishlistStore';

type ExtendedProduct = Product & {
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
};

export function ProductCard({ product, index = 0 }: { product: ExtendedProduct; index?: number }) {
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.id));

  const onSale = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const isNew = product.isNewArrival || (product.created_at && new Date(product.created_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
  const isBestseller = product.isBestSeller || product.review_count > 80 || product.featured;
  const isTrending = product.isTrending;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group flex flex-col"
    >
      <div className="relative overflow-hidden rounded-token-lg bg-sand-100">
        <Link to={`/product/${product.slug}`}>
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </div>
          {product.images[1] && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <img
                src={product.images[1]}
                alt={product.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {onSale && <Badge variant="sale">Sale</Badge>}
          {isTrending && !onSale && <Badge variant="bestseller">Trending</Badge>}
          {isNew && !onSale && !isTrending && <Badge variant="new">New</Badge>}
          {isBestseller && !onSale && !isTrending && !isNew && <Badge variant="bestseller">Bestseller</Badge>}
          {lowStock && <Badge variant="low-stock">Only {product.stock} left</Badge>}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={cn(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200',
            inWishlist
              ? 'bg-clay-500 text-sand-50'
              : 'bg-sand-50/70 text-ink-700 hover:bg-sand-50 hover:text-clay-600'
          )}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 flex flex-col gap-1">
        <StarRating rating={product.rating} showValue reviewCount={product.review_count} />
        <Link
          to={`/product/${product.slug}`}
          className="text-sm font-medium text-ink-900 hover:text-clay-600 transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-900">
            {formatPrice(Number(product.price))}
          </span>
          {onSale && (
            <span className="text-xs text-ink-400 line-through">
              {formatPrice(Number(product.compare_at_price))}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
