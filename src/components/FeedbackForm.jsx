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
<h4 style={styles.title}>📝 Give Feedback to <span style={{ color: '#22c55e' }}>{targetEmployee.name}</span></h4>

      {/* Star rating selector - Touch optimized with larger stars */}
      <label style={styles.label}>Rating (1–5):</label>
      <div style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                ...styles.star,
                color: star <= rating ? '#f59e0b' : '#d1d5db'
              }}
              onClick={() => setRating(star)}
              role="button"
              aria-label={`Rate ${star} stars`}
              tabIndex={0}
            >
              ★
            </span>
        ))}
        <span style={styles.ratingText}>{rating}/5</span>
      </div>

      {/* Comment box - Touch optimized */}
      <textarea
        style={styles.textarea}
        placeholder="Add a comment (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />

      {error   && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      {/* Submit button - Touch optimized */}
      <button 
        style={{
          ...styles.btn,
          opacity: loading ? 0.7 : 1
        }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '⏳ Submitting...' : '📤 Submit Feedback'}
      </button>
    </div>
  );
}

const styles = {
  container: { 
    background: '#f0fdf4', 
    padding: 20,              // Increased from 16
    borderRadius: 12,         // Slightly larger
    marginBottom: 20,        // Increased from 16
    border: '1px solid #bbf7d0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: 18,
    fontWeight: 600,
    color: '#1f2937'
  },
  label: { 
    fontSize: 15,             // Increased from 14
    fontWeight: 600, 
    display: 'block', 
    marginBottom: 8,
    color: '#374151'
  },
  stars: { 
    display: 'flex', 
    alignItems: 'center', 
    marginBottom: 16,         // Increased from 10
    gap: 4
  },
  star: { 
    fontSize: 24,
    cursor: 'pointer', 
    transition: 'color 0.2s',
    lineHeight: 1
  },
  ratingText: { 
    marginLeft: 12, 
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 500
  },
  textarea: { 
    width: '100%', 
    padding: '12px 14px',
    borderRadius: 8, 
    border: '1px solid #d1d5db', 
    boxSizing: 'border-box', 
    resize: 'vertical',
    fontSize: 14, 
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    outline: 'none',
    minHeight: 80
  },
  btn: { 
    width: '100%',
    marginTop: 12,
    padding: '12px 20px',
    background: '#22c55e',
    color: '#fff', 
    border: 'none', 
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
    minHeight: 44
  },
  error: { color: '#dc2626', fontSize: 14, margin: '8px 0', fontWeight: 500 },
  success: { color: '#16a34a', fontSize: 14, margin: '8px 0', fontWeight: 500 },
};

