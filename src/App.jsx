import { useState, lazy, Suspense } from 'react';
import styles from './styles/App.module.css';

// Lazy load components for route-level code splitting (Bonus)
const EmployeeList = lazy(() => import('./components/EmployeeList'));
const FeedbackForm = lazy(() => import('./components/FeedbackForm'));
const FeedbackList = lazy(() => import('./components/FeedbackList'));

export default function App() {
  const [selectedEmployee, setSelectedEmployee] = useState(null); // employee being viewed
  const [currentUser, setCurrentUser]           = useState(null); // "logged-in" user
  const [refreshKey, setRefreshKey]             = useState(0);    // triggers FeedbackList re-fetch

  // Called after feedback is submitted → refresh list
  const handleFeedbackSuccess = () => setRefreshKey((k) => k + 1);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>🏢 Employee Feedback Platform</h1>
        {currentUser && (
          <span className={styles.userBadge}>
            Logged in as: <strong>{currentUser.name}</strong>
          </span>
        )}
      </header>

      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <div className={styles.layout}>
      {/* Left Panel: Employee List */}
      <div className={styles.left}>
        <EmployeeList
          onSelect={handleEmployeeSelect}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      </div>

      {/* Right Panel: Feedback area */}
      <div className={styles.right}>
            {selectedEmployee ? (
              <>
                {/* Show form only if viewing someone else */}
                {currentUser && currentUser._id !== selectedEmployee._id && (
                  <FeedbackForm
                    targetEmployee={selectedEmployee}
                    currentUser={currentUser}
                    onSuccess={handleFeedbackSuccess}
                  />
                )}
                {currentUser && currentUser._id === selectedEmployee._id && (
                  <div className={styles.selfNote}>
                    ℹ️ You cannot give feedback to yourself.
                  </div>
                )}
                <FeedbackList
                  employee={selectedEmployee}
                  currentUser={currentUser}
                  refresh={refreshKey}
                />
              </>
            ) : (
              <div className={styles.placeholder}>
                Select an employee to view their feedback
              </div>
            )}
          </div>
        </div>
      </Suspense>
    </div>
  );
}
