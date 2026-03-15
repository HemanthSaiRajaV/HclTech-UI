import { useState } from 'react';
import { submitFeedback } from '../api';
import styles from '../styles/FeedbackForm.module.css';

export default function FeedbackForm({ targetEmployee, currentUser, onSuccess }) {
  const [rating, setRating]   = useState(3);       // default rating 3
  const [comment, setComment] = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser) {
      setError('Please select yourself from the employee list first');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await submitFeedback({
      givenBy: currentUser._id,   // logged-in user
      givenTo: targetEmployee._id, // target employee
      rating: Number(rating),
      comment,
    });

    setLoading(false);

    if (res.error) { setError(res.error); return; }

    setSuccess('✅ Feedback submitted!');
    setComment('');
    setRating(3);
    onSuccess && onSuccess(); // refresh feedback list
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>📝 Give Feedback to <span>{targetEmployee.name}</span></h4>

      {/* Star rating selector - Touch optimized with larger stars */}
      <label className={styles.label}>Rating (1–5):</label>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={styles.star}
              style={{ color: star <= rating ? '#f59e0b' : '#d1d5db' }}
              onClick={() => setRating(star)}
              role="button"
              aria-label={`Rate ${star} stars`}
              tabIndex={0}
            >
              ★
            </span>
        ))}
        <span className={styles.ratingText}>{rating}/5</span>
      </div>

      {/* Comment box - Touch optimized */}
      <textarea
        className={styles.textarea}
        placeholder="Add a comment (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />

      {error   && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      {/* Submit button - Touch optimized */}
      <button 
        className={styles.btn}
        style={{ opacity: loading ? 0.7 : 1 }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '⏳ Submitting...' : '📤 Submit Feedback'}
      </button>
    </div>
  );
}
