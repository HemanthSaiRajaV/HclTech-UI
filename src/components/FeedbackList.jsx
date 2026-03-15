import { useState, useEffect, useMemo } from 'react';
import { getFeedbackReceived, getAverageRating, deleteFeedback } from '../api';

export default function FeedbackList({ employee, currentUser, refresh }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [average, setAverage]     = useState({ average: 0, totalFeedbacks: 0 });
  const [loading, setLoading]     = useState(false);
  const [pressedBtn, setPressedBtn] = useState(null);    // Track pressed button for touch feedback

  // Re-fetch when employee changes or parent triggers refresh
  useEffect(() => {
    if (!employee) return;
    fetchData();
  }, [employee, refresh]);

  const fetchData = async () => {
    setLoading(true);
    const [fbData, avgData] = await Promise.all([
      getFeedbackReceived(employee._id),
      getAverageRating(employee._id),
    ]);
    setFeedbacks(fbData);
    setAverage(avgData);
    setLoading(false);
  };

  // Memoize sorted feedbacks (Bonus: memoization)
  const sortedFeedbacks = useMemo(
    () => [...feedbacks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [feedbacks]
  );

  const handleDelete = async (feedbackId) => {
    if (!currentUser) return alert('Select yourself first');
    const res = await deleteFeedback(feedbackId, currentUser._id);
    if (res.error) { alert(res.error); return; }
    fetchData(); // refresh after delete
  };

  // Touch event handlers for button feedback
  const handleTouchStart = (btnId) => setPressedBtn(btnId);
  const handleTouchEnd = () => setPressedBtn(null);

  if (!employee) return null;

  // Render star string based on rating - Larger for touch
  const stars = (rating) => {
    const filled = '★'.repeat(rating);
    const empty = '☆'.repeat(5 - rating);
    return { filled, empty };
  };

  return (
    <div style={styles.container}>
<h3 style={styles.title}>📊 Feedback for <span style={{ color: '#22c55e' }}>{employee.name}</span></h3>

      {/* Average Rating Card - Touch optimized */}
      <div style={styles.avgCard}>
        <div style={styles.avgScore}>{average.average ? average.average.toFixed(1) : '—'}</div>
        <div>
          <div style={styles.starsContainer}>
            {stars(Math.round(average.average || 0)).filled.split('').map((star, i) => (
              <span key={`filled-${i}`} style={styles.starFilled}>★</span>
            ))}
            {stars(5 - Math.round(average.average || 0)).empty.split('').map((star, i) => (
              <span key={`empty-${i}`} style={styles.starEmpty}>☆</span>
            ))}
          </div>
          <div style={styles.avgLabel}>{average.totalFeedbacks} feedback{average.totalFeedbacks !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {loading && <p style={styles.loadingText}>Loading...</p>}

      {/* Feedback List sorted by date - Touch optimized */}
      {sortedFeedbacks.length === 0 && !loading && (
        <p style={styles.emptyText}>No feedback yet.</p>
      )}

      {sortedFeedbacks.map((fb) => {
        const starData = stars(fb.rating);
        return (
          <div key={fb._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.ratingSection}>
                <div style={styles.starsRow}>
                  {starData.filled.split('').map((star, i) => (
                    <span key={`fb-filled-${i}`} style={styles.starFilled}>★</span>
                  ))}
                  {starData.empty.split('').map((star, i) => (
                    <span key={`fb-empty-${i}`} style={styles.starEmpty}>☆</span>
                  ))}
                </div>
                <span style={styles.ratingNum}> ({fb.rating}/5)</span>
              </div>
              {/* Delete button: visible only if current user is the giver - Touch optimized */}
              {currentUser && fb.givenBy?._id === currentUser._id && (
                <button 
                  style={{
                    ...styles.deleteBtn,
                    transform: pressedBtn === `delete-${fb._id}` ? 'scale(0.95)' : 'scale(1)',
                    boxShadow: pressedBtn === `delete-${fb._id}` 
                      ? 'inset 0 2px 4px rgba(0,0,0,0.2)' 
                      : '0 2px 6px rgba(239, 68, 68, 0.3)'
                  }}
                  onTouchStart={() => handleTouchStart(`delete-${fb._id}`)}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => handleDelete(fb._id)}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
            <p style={styles.comment}>{fb.comment || <em>No comment</em>}</p>
            <p style={styles.meta}>
              By: <strong>{fb.givenBy?.name || 'Unknown'}</strong> &nbsp;|&nbsp;
              {new Date(fb.createdAt).toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: { padding: 16 },
  title: {
    margin: '0 0 16px 0',
    fontSize: 20,
    fontWeight: 600,
    color: '#1f2937'
  },
  avgCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 20, 
    background: '#fef9c3', 
    padding: 20,              // Increased from 16
    borderRadius: 12,         // Slightly larger
    marginBottom: 20,        // Increased from 16
    boxShadow: '0 2px 8px rgba(254, 249, 195, 0.5)'
  },
  avgScore: { 
    fontSize: 48,            // Increased from 42
    fontWeight: 700, 
    color: '#d97706',
    minWidth: 60,
    textAlign: 'center'
  },
  starsContainer: { 
    display: 'flex', 
    alignItems: 'center',
    marginBottom: 4
  },
  starsRow: {
    display: 'flex',
    alignItems: 'center'
  },
  starFilled: { 
    color: '#f59e0b', 
    fontSize: 24,            // Increased from 22
    lineHeight: 1
  },
  starEmpty: { 
    color: '#d1d5db', 
    fontSize: 24,            // Increased from 22
    lineHeight: 1
  },
  avgLabel: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  loadingText: { color: '#64748b', fontSize: 15, padding: 20 },
  emptyText: { color: '#9ca3af', fontSize: 15, textAlign: 'center', padding: 20 },
  card: { 
    background: '#fff', 
    padding: 16,            // Increased from 12
    borderRadius: 12,       // Slightly larger
    marginBottom: 14,      // Increased from 10
    border: '1px solid #e5e7eb', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'transform 0.15s, box-shadow 0.15s'
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 8
  },
  ratingSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  ratingNum: { color: '#6b7280', fontSize: 14 },
  comment: { 
    margin: '10px 0',       // Increased from 6px
    color: '#374151', 
    fontSize: 15,           // Slightly larger
    lineHeight: 1.5 
  },
  meta: { 
    fontSize: 13,           // Increased from 12
    color: '#9ca3af', 
    margin: 0,
    paddingTop: 8,
    borderTop: '1px solid #f3f4f6'
  },
  deleteBtn: { 
    background: '#ef4444', 
    color: 'white', 
    border: 'none', 
    padding: '12px 16px',   // Increased from 6px 12px
    borderRadius: 8,        // Slightly larger
    cursor: 'pointer', 
    fontSize: 14,           // Increased from 12
    fontWeight: '600',
    transition: 'transform 0.1s, box-shadow 0.1s',
    touchAction: 'manipulation',
    minHeight: 44,          // Minimum 44px touch target
    whiteSpace: 'nowrap'
  },
};

