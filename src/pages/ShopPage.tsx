import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import type { Product, Category } from '@/types';
import { productApi } from '@/lib/api/productApi';
import { categoryApi } from '@/lib/api/categoryApi';
import { ProductCard } from '@/components/ProductCard';
import { SkeletonProductCard, EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const skinTypes = ['all', 'dry', 'oily', 'sensitive'];

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const category = searchParams.get('category') ?? '';
  const q = searchParams.get('q') ?? '';
  const sort = (searchParams.get('sort') as SortOption) ?? 'newest';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const skinType = searchParams.get('skinType') ?? '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productApi.getProducts({
        search: q,
        category,
        minPrice,
        maxPrice,
        skinType,
        sort,
      });
      setProducts(data);
    } catch (err) {
      console.error('[ShopPage Error]:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, q, sort, minPrice, maxPrice, skinType]);

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFilters = [category, skinType, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="pt-16 lg:pt-20">
      {/* Header */}
      <div className="border-b border-ink-100 bg-sand-100">
        <div className="container-page py-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-clay-600">
              {q ? `Search results for "${q}"` : 'Shop All'}
            </p>
            <h1 className="font-display text-4xl font-light text-ink-900 sm:text-5xl capitalize">
              {category
                ? categories.find((c) =>
                    c.slug === category ||
                    (category === 'sun-protection' && c.slug === 'sunscreen') ||
                    (category === 'sunscreen' && c.slug === 'sun-protection') ||
                    (category === 'masks-treatments' && c.slug === 'masks') ||
                    (category === 'masks' && c.slug === 'masks-treatments')
                  )?.name ?? category.replace(/-/g, ' ')
                : 'All Products'}
            </h1>
            <p className="mt-3 text-sm text-ink-500">
              {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
          >
            <SlidersHorizontal size={18} />
            Filters
            {activeFilters > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1.5 text-[10px] font-bold text-sand-50">
                {activeFilters}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
            >
              Sort: {sortOptions.find((s) => s.value === sort)?.label}
              <ChevronDown size={16} className={cn('transition-transform', sortOpen && 'rotate-180')} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full z-20 mt-2 w-56 rounded-token border border-ink-100 bg-sand-50 py-2 shadow-soft-lg"
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        updateParam('sort', opt.value);
                        setSortOpen(false);
                      }}
                      className={cn(
                        'block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-ink-50',
                        sort === opt.value ? 'font-medium text-ink-900' : 'text-ink-600'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar filters */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterPanel
              categories={categories}
              category={category}
              skinType={skinType}
              minPrice={minPrice}
              maxPrice={maxPrice}
              updateParam={updateParam}
              clearFilters={clearFilters}
              activeFilters={activeFilters}
            />
          </aside>

          {/* Mobile filter drawer */}
          {showFilters && (
            <>
              <div className="fixed inset-0 z-[60] bg-ink-900/40 lg:hidden" onClick={() => setShowFilters(false)} />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="fixed left-0 top-0 bottom-0 z-[70] w-80 max-w-[85vw] overflow-y-auto bg-sand-50 p-5 lg:hidden"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-lg text-ink-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} aria-label="Close filters">
                    <X size={20} className="text-ink-700" />
                  </button>
                </div>
                <FilterPanel
                  categories={categories}
                  category={category}
                  skinType={skinType}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  updateParam={updateParam}
                  clearFilters={clearFilters}
                  activeFilters={activeFilters}
                />
              </motion.aside>
            </>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => <SkeletonProductCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={<SlidersHorizontal size={32} />}
                title="No products found"
                description="Try adjusting your filters or search terms to find what you're looking for."
                action={<Button variant="outline" onClick={clearFilters}>Clear Filters</Button>}
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  categories,
  category,
  skinType,
  minPrice,
  maxPrice,
  updateParam,
  clearFilters,
  activeFilters,
}: {
  categories: Category[];
  category: string;
  skinType: string;
  minPrice: string;
  maxPrice: string;
  updateParam: (key: string, value: string) => void;
  clearFilters: () => void;
  activeFilters: number;
}) {
  return (
    <div className="space-y-8">
      {activeFilters > 0 && (
        <button
          onClick={clearFilters}
          className="text-xs font-medium uppercase tracking-wide text-clay-600 hover:text-clay-700 transition-colors"
        >
          Clear all ({activeFilters})
        </button>
      )}

      {/* Category */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900">Category</h4>
        <div className="space-y-2">
          <button
            onClick={() => updateParam('category', '')}
            className={cn(
              'block text-sm transition-colors',
              !category ? 'font-medium text-ink-900' : 'text-ink-600 hover:text-ink-900'
            )}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={cn(
                'block text-sm transition-colors',
                category === cat.slug ? 'font-medium text-ink-900' : 'text-ink-600 hover:text-ink-900'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="h-10 w-full rounded-token border border-ink-200 bg-sand-50 px-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-ink-900"
          />
          <span className="text-ink-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="h-10 w-full rounded-token border border-ink-200 bg-sand-50 px-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-ink-900"
          />
        </div>
      </div>

      {/* Skin Type */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-900">Skin Type</h4>
        <div className="space-y-2">
          {skinTypes.map((type) => (
            <button
              key={type}
              onClick={() => updateParam('skinType', type === 'all' ? '' : type)}
              className={cn(
                'block text-sm capitalize transition-colors',
                (skinType === type || (type === 'all' && !skinType)) ? 'font-medium text-ink-900' : 'text-ink-600 hover:text-ink-900'
              )}
            >
              {type === 'all' ? 'All Skin Types' : type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
