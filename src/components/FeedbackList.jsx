import { useState, useEffect, useMemo } from 'react';
import { getFeedbackReceived, getAverageRating, deleteFeedback } from '../api';

export default function FeedbackList({ employee, currentUser, refresh }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [average, setAverage]     = useState({ average: 0, totalFeedbacks: 0 });
  const [loading, setLoading]     = useState(false);

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

  if (!employee) return null;

  // Render star string based on rating
  const stars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div style={styles.container}>
      <h3>📊 Feedback for <span style={{ color: '#6366f1' }}>{employee.name}</span></h3>

      {/* Average Rating Card */}
      <div style={styles.avgCard}>
        <div style={styles.avgScore}>{average.average || '—'}</div>
        <div>
          <div style={{ color: '#f59e0b', fontSize: 22 }}>{stars(Math.round(average.average))}</div>
          <div style={styles.avgLabel}>{average.totalFeedbacks} feedback(s)</div>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {/* Feedback List sorted by date */}
      {sortedFeedbacks.length === 0 && !loading && (
        <p style={{ color: '#9ca3af' }}>No feedback yet.</p>
      )}

      {sortedFeedbacks.map((fb) => (
        <div key={fb._id} style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <span style={{ color: '#f59e0b' }}>{stars(fb.rating)}</span>
              <span style={styles.ratingNum}> ({fb.rating}/5)</span>
            </div>
            {/* Delete button: visible only if current user is the giver */}
            {currentUser && fb.givenBy?._id === currentUser._id && (
              <button style={styles.deleteBtn} onClick={() => handleDelete(fb._id)}>
                🗑
              </button>
            )}
          </div>
          <p style={styles.comment}>{fb.comment || <em>No comment</em>}</p>
          <p style={styles.meta}>
            By: <strong>{fb.givenBy?.name || 'Unknown'}</strong> &nbsp;|&nbsp;
            {new Date(fb.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { padding: 16 },
  avgCard: { display: 'flex', alignItems: 'center', gap: 16, background: '#fef9c3', padding: 16, borderRadius: 10, marginBottom: 16 },
  avgScore: { fontSize: 42, fontWeight: 700, color: '#d97706' },
  avgLabel: { fontSize: 13, color: '#6b7280' },
  card: { background: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  ratingNum: { color: '#6b7280', fontSize: 13 },
  comment: { margin: '6px 0', color: '#374151' },
  meta: { fontSize: 12, color: '#9ca3af', margin: 0 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 },
};
