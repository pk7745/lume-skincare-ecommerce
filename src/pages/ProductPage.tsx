import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Minus, Plus, Truck, RotateCcw, Check, ChevronDown, Eye } from 'lucide-react';
import type { Product, Review } from '@/types';
import { productApi } from '@/lib/api/productApi';
import { reviewApi } from '@/lib/api/reviewApi';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { formatPrice, cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton, EmptyState, ErrorState } from '@/components/ui/States';
import { Textarea, Input } from '@/components/ui/Input';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>('details');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => (product ? s.has(product.id) : false));
  const user = useAuthStore((s) => s.user);

  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addProduct);
  const recentlyViewed = useRecentlyViewedStore((s) => s.products).filter((p) => product && p.id !== product.id);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    setActiveImage(0);
    setQty(1);

    (async () => {
      try {
        const prod = await productApi.getProductBySlug(slug);
        if (!prod) {
          setError(true);
          setLoading(false);
          return;
        }

        setProduct(prod);
        setSelectedSize(prod.sizes[0] ?? '');
        addRecentlyViewed(prod);

        // Log view event asynchronously
        productApi.logEvent(prod.id, 'view');

        // Fetch recommendations & reviews in parallel
        const [recsRes, revRes] = await Promise.all([
          productApi.getRecommendations(prod.id, 4),
          reviewApi.getProductReviews(prod.id),
        ]);

        setRecommendations(recsRes);
        setReviews(revRes);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addItem(product, selectedSize, qty);
    productApi.logEvent(product.id, 'cart_add', qty);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist(product.id);
    productApi.logEvent(product.id, 'wishlist_add');
  };

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !product) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const rating = Number(formData.get('rating'));
    const title = formData.get('title') as string;
    const body = formData.get('body') as string;

    try {
      const newReview = await reviewApi.createReview(product.id, {
        rating,
        title,
        body,
      });

      if (newReview) {
        setReviews([newReview, ...reviews]);
        setShowReviewForm(false);
        form.reset();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    }
  };

  if (loading) return <ProductSkeleton />;
  if (error || !product)
    return (
      <div className="pt-20">
        <ErrorState
          title="Product not found"
          description="This product may have been removed or the link is incorrect."
        />
      </div>
    );

  const onSale = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="pt-16 lg:pt-20">
      {/* Breadcrumb */}
      <div className="container-page py-4">
        <nav className="flex items-center gap-2 text-xs text-ink-500">
          <Link to="/" className="hover:text-ink-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-ink-900 transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-ink-900">{product.name}</span>
        </nav>
      </div>

      {/* Main product section */}
      <div className="container-page pb-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-token-xl bg-sand-100"
            >
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="aspect-[3/4] w-full object-cover"
              />
            </motion.div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'overflow-hidden rounded-token border-2 transition-all',
                      activeImage === i ? 'border-ink-900' : 'border-transparent hover:border-ink-300'
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="h-20 w-16 object-cover sm:h-24 sm:w-20"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-2 mb-3">
              {onSale && <Badge variant="sale">Sale</Badge>}
              {product.featured && <Badge variant="bestseller">Bestseller</Badge>}
              {lowStock && <Badge variant="low-stock">Only {product.stock} left in stock</Badge>}
            </div>

            <h1 className="font-display text-3xl font-light text-ink-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={product.rating} size="md" showValue reviewCount={product.review_count} />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-2xl font-semibold text-ink-900">
                {formatPrice(Number(product.price))}
              </span>
              {onSale && (
                <span className="text-lg text-ink-400 line-through">
                  {formatPrice(Number(product.compare_at_price))}
                </span>
              )}
            </div>

            <p className="mt-5 text-base leading-relaxed text-ink-600">{product.description}</p>

            {/* Size selector */}
            {product.sizes.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-900">
                    Size
                  </span>
                  <span className="text-xs text-ink-500 capitalize">For {product.skin_type} skin</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'rounded-token border px-5 py-2.5 text-sm font-medium transition-all',
                        selectedSize === size
                          ? 'border-ink-900 bg-ink-900 text-sand-50'
                          : 'border-ink-200 text-ink-700 hover:border-ink-900'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center rounded-token border border-ink-200">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="flex h-12 w-12 items-center justify-center text-ink-600 hover:text-ink-900 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-ink-900">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  disabled={qty >= product.stock}
                  className="flex h-12 w-12 items-center justify-center text-ink-600 hover:text-ink-900 transition-colors disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
              </Button>
              <button
                onClick={handleToggleWishlist}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-token border transition-all',
                  inWishlist
                    ? 'border-clay-500 bg-clay-500 text-sand-50'
                    : 'border-ink-200 text-ink-700 hover:border-ink-900'
                )}
                aria-label="Toggle wishlist"
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Stock indicator */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-warning-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning-500" />
                Only {product.stock} left in stock — order soon
              </p>
            )}

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-ink-100 pt-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <Truck size={20} className="text-clay-500" />
                <p className="text-xs text-ink-600">
                  Free shipping
                  <br />
                  over ₹1,500
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <RotateCcw size={20} className="text-clay-500" />
                <p className="text-xs text-ink-600">
                  30-day
                  <br />
                  returns
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Check size={20} className="text-clay-500" />
                <p className="text-xs text-ink-600">
                  Dermatologist
                  <br />
                  tested
                </p>
              </div>
            </div>

            {/* Accordion sections */}
            <div className="mt-8 border-t border-ink-100">
              {[
                { id: 'details', label: 'Product Details', content: product.description },
                {
                  id: 'ingredients',
                  label: 'Key Ingredients',
                  content:
                    'Glycerin — a humectant that draws moisture into the skin. Green Tea Extract — a powerful antioxidant that protects against environmental stress. Niacinamide — helps refine pores and even skin tone. Formulated without parabens, sulfates, or synthetic fragrances.',
                },
                {
                  id: 'how-to-use',
                  label: 'How to Use',
                  content:
                    'Apply 1-2 pumps to damp skin. Massage gently in circular motions, avoiding the eye area. Rinse thoroughly with lukewarm water. Use morning and evening for best results.',
                },
              ].map((section) => (
                <div key={section.id} className="border-b border-ink-100">
                  <button
                    onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                    className="flex w-full items-center justify-between py-4 text-sm font-medium text-ink-900"
                  >
                    {section.label}
                    <ChevronDown
                      size={18}
                      className={cn('transition-transform', openSection === section.id && 'rotate-180')}
                    />
                  </button>
                  {openSection === section.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-sm leading-relaxed text-ink-600">{section.content}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <section className="border-t border-ink-100 bg-sand-100 py-16">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-light text-ink-900 sm:text-3xl">
                Customer Reviews
              </h2>
              <div className="mt-2 flex items-center gap-3">
                <StarRating rating={product.rating} size="md" showValue reviewCount={product.review_count} />
              </div>
            </div>
            {user && (
              <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                Write a Review
              </Button>
            )}
          </div>

          {/* Review form */}
          {showReviewForm && user && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 rounded-token-lg border border-ink-100 bg-sand-50 p-6"
              onSubmit={handleSubmitReview}
            >
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} className="cursor-pointer">
                      <input type="radio" name="rating" value={n} required className="sr-only peer" />
                      <span className="text-2xl text-ink-200 hover:text-clay-500 peer-checked:text-clay-500">
                        ★
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="title" label="Title" placeholder="Great product!" required />
              </div>
              <div className="mt-4">
                <Textarea
                  name="body"
                  label="Your Review"
                  rows={4}
                  placeholder="Share your experience..."
                  required
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button type="submit" variant="primary">
                  Submit Review
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="Be the first to share your experience with this product."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-token-lg border border-ink-100 bg-sand-50 p-6"
                >
                  <div className="flex items-center justify-between">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-ink-400">{formatDate(review.created_at)}</span>
                  </div>
                  {review.title && (
                    <h4 className="mt-3 text-sm font-semibold text-ink-900">{review.title}</h4>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{review.body}</p>
                  <p className="mt-4 text-xs font-medium text-ink-500">— {review.user_name}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="container-page py-16">
          <h2 className="mb-8 font-display text-2xl font-light text-ink-900 sm:text-3xl">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {recommendations.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="container-page border-t border-ink-100 py-16">
          <div className="mb-8 flex items-center gap-2">
            <Eye size={18} className="text-clay-600" />
            <h2 className="font-display text-2xl font-light text-ink-900 sm:text-3xl">
              Recently Viewed
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {recentlyViewed.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="pt-20 container-page">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <Skeleton className="aspect-[3/4] w-full rounded-token-xl" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-20 w-16" />
            <Skeleton className="h-20 w-16" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
