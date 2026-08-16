import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api/adminApi';
import type { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import { StarRating } from '@/components/ui/StarRating';

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('[AdminReviews Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await adminApi.deleteReview(id);
      await loadReviews();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-light text-ink-900">Review Moderation</h1>
        <p className="mt-1 text-sm text-ink-500">Monitor product reviews and remove inappropriate content</p>
      </div>

      <div className="rounded-token-lg border border-ink-100 bg-sand-50 overflow-hidden shadow-soft">
        {loading ? (
          <p className="p-6 text-sm text-ink-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="p-6 text-sm text-ink-500">No reviews found.</p>
        ) : (
          <div className="divide-y divide-ink-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-5 flex items-start justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-ink-400">{formatDate(review.created_at)}</span>
                  </div>
                  {review.title && (
                    <h4 className="text-sm font-semibold text-ink-900">{review.title}</h4>
                  )}
                  <p className="text-sm text-ink-700 leading-relaxed">{review.body}</p>
                  <p className="text-xs text-ink-500 pt-1">Author: {review.user_name}</p>
                </div>

                <button
                  onClick={() => handleDelete(review.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-token border border-error-200 text-error-600 hover:bg-error-600 hover:text-sand-50 transition-colors shrink-0"
                  aria-label="Delete review"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
