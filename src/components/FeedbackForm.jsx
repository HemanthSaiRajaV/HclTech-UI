import { useState } from 'react';
import { submitFeedback } from '../api';

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
    <div style={styles.container}>
      <h4>📝 Give Feedback to <span style={{ color: '#6366f1' }}>{targetEmployee.name}</span></h4>

      {/* Star rating selector */}
      <label style={styles.label}>Rating (1–5):</label>
      <div style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{ fontSize: 28, cursor: 'pointer', color: star <= rating ? '#f59e0b' : '#d1d5db' }}
            onClick={() => setRating(star)}
          >
            ★
          </span>
        ))}
        <span style={{ marginLeft: 8, fontSize: 14 }}>{rating}/5</span>
      </div>

      {/* Comment box */}
      <textarea
        style={styles.textarea}
        placeholder="Add a comment (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />

      {error   && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
}

const styles = {
  container: { background: '#f0fdf4', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #bbf7d0' },
  label: { fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 4 },
  stars: { display: 'flex', alignItems: 'center', marginBottom: 10 },
  textarea: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', boxSizing: 'border-box', resize: 'vertical' },
  btn: { marginTop: 10, padding: '8px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  error: { color: 'red', fontSize: 13 },
  success: { color: 'green', fontSize: 13 },
};
