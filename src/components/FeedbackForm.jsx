import { useState } from 'react';
import { submitFeedback } from '../api';

export default function FeedbackForm({ targetEmployee, currentUser, onSuccess }) {
  const [rating, setRating]   = useState(3);       // default rating 3
  const [comment, setComment] = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pressedBtn, setPressedBtn] = useState(false);    // Track pressed button for touch feedback

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

  // Touch event handlers for button feedback
  const handleTouchStart = () => setPressedBtn(true);
  const handleTouchEnd = () => setPressedBtn(false);

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
              color: star <= rating ? '#f59e0b' : '#d1d5db',
              transform: star <= rating ? 'scale(1.15)' : 'scale(1)',
              textShadow: star <= rating ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none'
            }}
            onClick={() => setRating(star)}
            onTouchEnd={() => setRating(star)}  // Better touch support
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
          transform: pressedBtn ? 'scale(0.97)' : 'scale(1)',
          boxShadow: pressedBtn 
            ? 'inset 0 2px 4px rgba(0,0,0,0.2)' 
            : '0 4px 12px rgba(99, 102, 241, 0.4)',
          opacity: loading ? 0.7 : 1
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
    fontSize: 36,             // Increased from 28 - much larger for easy tapping
    cursor: 'pointer', 
    transition: 'transform 0.15s, color 0.15s',
    padding: '4px 2px',       // Add padding for larger touch area
    touchAction: 'manipulation',
    lineHeight: 1
  },
  ratingText: { 
    marginLeft: 12, 
    fontSize: 16,             // Increased from 14
    color: '#6b7280',
    fontWeight: 500
  },
  textarea: { 
    width: '100%', 
    padding: '14px 16px',    // Increased from 8px 10px
    borderRadius: 10,        // Slightly larger
    border: '1px solid #d1d5db', 
    boxSizing: 'border-box', 
    resize: 'vertical',
    fontSize: 16,            // Increased from default - better mobile
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    touchAction: 'manipulation',
    minHeight: 100           // Taller for easier typing on mobile
  },
btn: { 
    width: '100%',           // Full width for easier touch
    marginTop: 14,           // Increased from 10
    padding: '16px 24px',   // Increased from 8px 20px
    background: '#22c55e',
    color: '#fff', 
    border: 'none', 
    borderRadius: 10,        // Slightly larger
    cursor: 'pointer',
    fontSize: 16,            // Increased from default
    fontWeight: 600,
    transition: 'transform 0.1s, box-shadow 0.1s',
    touchAction: 'manipulation',
    minHeight: 52            // Minimum 44px touch target (larger for primary action)
  },
  error: { color: '#dc2626', fontSize: 14, margin: '8px 0', fontWeight: 500 },
  success: { color: '#16a34a', fontSize: 14, margin: '8px 0', fontWeight: 500 },
};

