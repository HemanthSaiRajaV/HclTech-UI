import { useState, useEffect, useMemo } from 'react';
import { getFeedbackReceived, getAverageRating, deleteFeedback } from '../api';
import styles from '../styles/FeedbackList.module.css';

export default function FeedbackList({ employee, currentUser, refresh }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [average, setAverage]     = useState({ average: 0, totalFeedbacks: 0 });
  const [loading, setLoading]     = useState(false);

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

  // Re-fetch when employee changes or parent triggers refresh
  useEffect(() => {
    if (!employee) return;
    fetchData();
  }, [employee, refresh]);

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

  // Render star string based on rating - Larger for touch
  const stars = (rating) => {
    const filled = '★'.repeat(rating);
    const empty = '☆'.repeat(5 - rating);
    return { filled, empty };
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📊 Feedback for <span>{employee.name}</span></h3>

      {/* Average Rating Card - Touch optimized */}
      <div className={styles.avgCard}>
        <div className={styles.avgScore}>{average.average ? average.average.toFixed(1) : '—'}</div>
        <div>
          <div className={styles.starsContainer}>
            {stars(Math.round(average.average || 0)).filled.split('').map((star, i) => (
              <span key={`filled-${i}`} className={styles.starFilled}>★</span>
            ))}
            {stars(5 - Math.round(average.average || 0)).empty.split('').map((star, i) => (
              <span key={`empty-${i}`} className={styles.starEmpty}>☆</span>
            ))}
          </div>
          <div className={styles.avgLabel}>{average.totalFeedbacks} feedback{average.totalFeedbacks !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {loading && <p className={styles.loadingText}>Loading...</p>}

      {/* Feedback List sorted by date - Touch optimized */}
      {sortedFeedbacks.length === 0 && !loading && (
        <p className={styles.emptyText}>No feedback yet.</p>
      )}

      {sortedFeedbacks.map((fb) => {
        const starData = stars(fb.rating);
        return (
          <div key={fb._id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.ratingSection}>
                <div className={styles.starsRow}>
                  {starData.filled.split('').map((star, i) => (
                    <span key={`fb-filled-${i}`} className={styles.starFilled}>★</span>
                  ))}
                  {starData.empty.split('').map((star, i) => (
                    <span key={`fb-empty-${i}`} className={styles.starEmpty}>☆</span>
                  ))}
                </div>
                <span className={styles.ratingNum}> ({fb.rating}/5)</span>
              </div>
              {/* Delete button: visible only if current user is the giver - Touch optimized */}
              {currentUser && fb.givenBy?._id === currentUser._id && (
                <button 
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(fb._id)}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
            <p className={styles.comment}>{fb.comment || <em>No comment</em>}</p>
            <p className={styles.meta}>
              By: <strong>{fb.givenBy?.name || 'Unknown'}</strong> &nbsp;|&nbsp;
              {new Date(fb.createdAt).toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
