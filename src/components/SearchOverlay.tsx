import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles } from 'lucide-react';
import { productApi } from '@/lib/api/productApi';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await productApi.getAutocomplete(query.trim(), 6);
        setResults(data);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-ink-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 right-0 top-0 z-[90] bg-sand-50 shadow-soft-xl"
          >
            <div className="container-page py-6">
              <form onSubmit={handleSubmit} className="relative">
                <Search size={22} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, ingredients, concerns..."
                  className="w-full border-b border-ink-200 bg-transparent py-3 pl-10 pr-10 font-display text-2xl text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-ink-900 sm:text-3xl"
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900 transition-colors"
                  aria-label="Close search"
                >
                  <X size={24} />
                </button>
              </form>

              {/* Autocomplete suggestions */}
              {query.length >= 2 && (
                <div className="mt-6">
                  {loading && <p className="text-sm text-ink-400">Searching catalog...</p>}
                  {!loading && results.length === 0 && (
                    <p className="text-sm text-ink-500">No products found matching "{query}".</p>
                  )}
                  {!loading && results.length > 0 && (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
                          {results.length} suggestion{results.length !== 1 ? 's' : ''}
                        </p>
                        <button
                          onClick={handleSubmit}
                          className="text-xs text-clay-600 hover:underline flex items-center gap-1"
                        >
                          <Sparkles size={12} /> View all search results
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {results.map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-token p-2 hover:bg-ink-100/50 transition-colors"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-16 w-14 rounded-token object-cover bg-sand-200"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-ink-900 truncate">{product.name}</p>
                              <p className="text-xs text-ink-500">{formatPrice(Number(product.price))}</p>
                              {product.skin_type && (
                                <span className="text-[10px] uppercase text-clay-600 font-medium">
                                  For {product.skin_type} skin
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Quick links */}
              {query.length < 2 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-500">
                    Popular searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Vitamin C', 'Retinol', 'SPF', 'Hyaluronic Acid', 'Cleanser', 'Moisturizer'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="rounded-full border border-ink-200 px-4 py-2 text-xs font-medium text-ink-700 hover:border-ink-900 hover:bg-ink-50 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
