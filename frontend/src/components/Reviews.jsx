import { useState, useEffect } from "react";
import { useAuth, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Star, ThumbsUp, Trash2, Send } from "lucide-react";

const Reviews = ({ placeId, placeType = "place" }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API}/reviews/place/${placeId}?place_type=${placeType}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.avg_rating || 0);
      setReviewCount(data.review_count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [placeId, placeType]);

  const handleSubmit = async () => {
    if (newRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/reviews/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          place_id: placeId,
          place_type: placeType,
          rating: newRating,
          text: newText || null,
          photos: []
        })
      });
      
      if (!res.ok) throw new Error("Failed to submit");
      
      toast.success("Review submitted!");
      setNewRating(0);
      setNewText("");
      setShowForm(false);
      fetchReviews();
    } catch (e) {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      const res = await fetch(`${API}/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Review deleted");
      fetchReviews();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await fetch(`${API}/reviews/${reviewId}/helpful`, { method: "POST" });
      fetchReviews();
    } catch (e) {}
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold">Reviews</h3>
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-medium">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
            </div>
          )}
        </div>
        {user && !showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="rounded-full"
            data-testid="write-review-btn"
          >
            Write Review
          </Button>
        )}
      </div>

      {/* Write Review Form */}
      {showForm && (
        <div className="p-4 rounded-2xl bg-muted/30 space-y-4" data-testid="review-form">
          {/* Rating Stars */}
          <div>
            <p className="text-sm font-medium mb-2">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                  data-testid={`rating-star-${star}`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= newRating
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Text */}
          <Textarea
            placeholder="Share your experience (optional)"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={3}
            className="resize-none rounded-xl"
            data-testid="review-text"
          />
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => { setShowForm(false); setNewRating(0); setNewText(""); }}
              className="flex-1 rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || newRating === 0}
              className="flex-1 rounded-full bg-foreground text-background hover:bg-foreground/90"
              data-testid="submit-review-btn"
            >
              {submitting ? "Posting..." : "Post"}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-2xl mb-2">💬</p>
          <p className="text-sm">No reviews yet</p>
          {user && !showForm && (
            <p className="text-xs mt-1">Be the first to share your experience!</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.review_id}
              className="p-4 rounded-2xl bg-muted/20"
              data-testid={`review-${review.review_id}`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.user_picture} />
                  <AvatarFallback className="text-xs">
                    {review.user_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{review.user_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? "fill-amber-500 text-amber-500"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {user?.user_id === review.user_id && (
                      <button
                        onClick={() => handleDelete(review.review_id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        data-testid={`delete-review-${review.review_id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {review.text && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {review.text}
                    </p>
                  )}
                  
                  <button
                    onClick={() => handleHelpful(review.review_id)}
                    className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
