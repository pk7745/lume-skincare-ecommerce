import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { productApi } from '@/lib/api/productApi';
import { categoryApi } from '@/lib/api/categoryApi';
import type { Product, Category } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    images: '',
    sizes: '50ml',
    skin_type: 'all',
    featured: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productApi.getProducts({ limit: 100 }),
        categoryApi.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('[AdminProducts Load Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: categories[0]?.id || '',
      stock: '50',
      images: 'https://images.pexels.com/photos/8101534/pexels-photo-8101534.jpeg',
      sizes: '50ml',
      skin_type: 'all',
      featured: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category_id: p.category_id || '',
      stock: String(p.stock),
      images: p.images.join(', '),
      sizes: p.sizes.join(', ') || '50ml',
      skin_type: p.skin_type || 'all',
      featured: p.featured,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Partial<Product> = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category_id: formData.category_id,
        stock: Number(formData.stock),
        images: formData.images.split(',').map((s) => s.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        skin_type: formData.skin_type,
        featured: formData.featured,
      };

      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, payload);
      } else {
        await productApi.createProduct(payload);
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.deleteProduct(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-ink-900">Product Management</h1>
          <p className="mt-1 text-sm text-ink-500">Create, edit, and manage catalog inventory</p>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-2">
          <Plus size={18} /> Add New Product
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-token-lg border border-ink-100 bg-sand-50 overflow-hidden shadow-soft">
        {loading ? (
          <p className="p-6 text-sm text-ink-500">Loading catalog...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-sand-100 text-xs font-semibold uppercase tracking-wider text-ink-700">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-sand-100/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="h-12 w-10 rounded-token object-cover bg-sand-200" />
                      <div>
                        <p className="font-medium text-ink-900">{p.name}</p>
                        <p className="text-xs text-ink-500">{p.slug}</p>
                      </div>
                    </td>
                    <td className="p-4 text-ink-700 capitalize">
                      {categories.find((c) => c.id === p.category_id)?.name || 'Default'}
                    </td>
                    <td className="p-4 font-medium text-ink-900">{formatPrice(Number(p.price))}</td>
                    <td className="p-4">
                      <span className={p.stock < 10 ? 'font-semibold text-warning-600' : 'text-ink-700'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-4 text-ink-700">
                      {p.rating} ★ ({p.review_count})
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-token border border-ink-200 text-ink-700 hover:bg-ink-900 hover:text-sand-50 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-token border border-error-200 text-error-600 hover:bg-error-600 hover:text-sand-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-token-xl border border-ink-100 bg-sand-50 p-6 shadow-soft-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-ink-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X size={20} className="text-ink-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Textarea
                label="Description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <Input
                  label="Stock Quantity"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full rounded-token border border-ink-200 bg-sand-50 px-3 py-2.5 text-sm text-ink-900"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Image URLs (comma separated)"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                required
              />
              <Input
                label="Sizes (comma separated)"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-ink-300"
                />
                <label htmlFor="featured" className="text-sm font-medium text-ink-900">
                  Featured Product (Bestseller)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-ink-100">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
