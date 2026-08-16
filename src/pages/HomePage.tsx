import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Leaf, Flame } from 'lucide-react';
import type { Product, Category } from '@/types';
import { productApi } from '@/lib/api/productApi';
import { categoryApi } from '@/lib/api/categoryApi';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/States';

export function HomePage() {
  const [trending, setTrending] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [trendRes, bestRes, newRes, catRes] = await Promise.all([
          productApi.getTrending(4),
          productApi.getBestSellers(4),
          productApi.getNewArrivals(4),
          categoryApi.getCategories(),
        ]);
        setTrending(trendRes);
        setBestSellers(bestRes);
        setNewArrivals(newRes);
        setCategories(catRes);
      } catch (err) {
        console.error('[HomePage Data Fetch Error]:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-16 pb-20 pt-16 lg:gap-24 lg:pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-sand-100 py-20 lg:py-32">
        <div className="container-page relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-clay-600">
                Pure • Potent • Proven
              </span>
              <h1 className="font-display text-4xl font-light text-ink-900 sm:text-5xl lg:text-6xl lg:leading-tight">
                Skincare rooted in science, refined by nature.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-ink-600 sm:text-lg">
                Thoughtfully formulated rituals to restore, protect, and illuminate your skin’s natural barrier.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/shop">
                  <Button variant="primary" size="lg" className="flex items-center gap-2">
                    Shop All Formulas <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/shop?category=serums">
                  <Button variant="outline" size="lg">
                    Discover Serums
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container-page">
        <div className="mb-8 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-clay-600">Categories</p>
          <h2 className="mt-1 font-display text-2xl font-light text-ink-900 sm:text-3xl">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => (
            <Link key={cat.id} to={`/shop?category=${cat.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group flex flex-col items-center rounded-token-lg border border-ink-100 bg-sand-50 p-5 text-center transition-all duration-300 hover:border-ink-900 hover:shadow-soft"
              >
                <span className="font-display text-base font-medium text-ink-900 group-hover:text-clay-600 transition-colors">
                  {cat.name}
                </span>
                <span className="mt-1 text-xs text-ink-400">Explore →</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="container-page">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-clay-600">
              <Flame size={14} className="text-clay-500" /> Trending Right Now
            </div>
            <h2 className="mt-1 font-display text-2xl font-light text-ink-900 sm:text-3xl">Customer Favorites</h2>
          </div>
          <Link to="/shop?sort=trending" className="text-xs font-semibold uppercase tracking-wider text-ink-900 hover:text-clay-600 transition-colors">
            View All →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full rounded-token-lg" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {trending.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      <section className="container-page">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-clay-600">Best Sellers</p>
            <h2 className="mt-1 font-display text-2xl font-light text-ink-900 sm:text-3xl">Most Loved Formulas</h2>
          </div>
          <Link to="/shop?sort=popular" className="text-xs font-semibold uppercase tracking-wider text-ink-900 hover:text-clay-600 transition-colors">
            Shop Best Sellers →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full rounded-token-lg" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {bestSellers.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="container-page">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-clay-600">Fresh Release</p>
              <h2 className="mt-1 font-display text-2xl font-light text-ink-900 sm:text-3xl">New Arrivals</h2>
            </div>
            <Link to="/shop?sort=newest" className="text-xs font-semibold uppercase tracking-wider text-ink-900 hover:text-clay-600 transition-colors">
              Explore New →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {newArrivals.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Brand Value Pillars */}
      <section className="border-y border-ink-100 bg-sand-100 py-16">
        <div className="container-page grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <Sparkles size={24} className="mb-3 text-clay-500" />
            <h3 className="font-display text-lg text-ink-900">Clinically Dosed Actives</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              Formulated at proven concentrations to deliver visible barrier transformation.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Leaf size={24} className="mb-3 text-clay-500" />
            <h3 className="font-display text-lg text-ink-900">100% Clean & Sustainable</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              Cruelty-free, vegan, and packaged in recyclable glass containers.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <ShieldCheck size={24} className="mb-3 text-clay-500" />
            <h3 className="font-display text-lg text-ink-900">Dermatologist Tested</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              Tested on all skin types and tones to ensure maximum safety and comfort.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
