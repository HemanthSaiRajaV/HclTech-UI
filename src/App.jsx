import { useState, lazy, Suspense } from 'react';

// Lazy load components for route-level code splitting (Bonus)
const EmployeeList = lazy(() => import('./components/EmployeeList'));
const FeedbackForm = lazy(() => import('./components/FeedbackForm'));
const FeedbackList = lazy(() => import('./components/FeedbackList'));

export default function App() {
  const [selectedEmployee, setSelectedEmployee] = useState(null); // employee being viewed
  const [currentUser, setCurrentUser]           = useState(null); // "logged-in" user
  const [refreshKey, setRefreshKey]             = useState(0);    // triggers FeedbackList re-fetch
  const [showEmployeeList, setShowEmployeeList] = useState(true);

  // Called after feedback is submitted → refresh list
  const handleFeedbackSuccess = () => setRefreshKey((k) => k + 1);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>🏢 Employee Feedback Platform</h1>
        {currentUser && (
          <span style={styles.userBadge}>
            Logged in as: <strong>{currentUser.name}</strong>
          </span>
        )}
      </header>

      <Suspense fallback={<div style={styles.loading}>Loading...</div>}>
        <div style={styles.layout}>
      {/* Left Panel: Employee List */}
      <div style={styles.left}>
        <EmployeeList
          onSelect={handleEmployeeSelect}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      </div>

      {/* Right Panel: Feedback area */}
      <div style={styles.right}>
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
                  <div style={styles.selfNote}>
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
              <div style={styles.placeholder}>
                Select an employee to view their feedback
              </div>
            )}
          </div>
        </div>
      </Suspense>
    </div>
  );
}

const styles = {
  app: { 
    fontFamily: 'Inter, sans-serif', 
    minHeight: '100vh', 
    background: '#f8fafc'
  },
header: { 
    background: '#22c55e', 
    color: '#fff', 
    padding: '16px 20px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
  },
  title: { 
    margin: 0, 
    fontSize: 18,
    fontWeight: 600
  },
  userBadge: { 
    background: 'rgba(255,255,255,0.2)', 
    padding: '6px 14px', 
    borderRadius: 20, 
    fontSize: 13,
    whiteSpace: 'nowrap'
  },
  layout: { 
    display: 'flex', 
    gap: 0, 
    minHeight: 'calc(100vh - 60px)',
    flexDirection: 'row'
  },
  left: { 
    width: '100%',           // Full width on mobile
    maxWidth: 380,           // Max width on desktop
    borderRight: '1px solid #e5e7eb', 
    background: '#fff', 
    overflowY: 'auto',
    height: 'calc(100vh - 60px)'
  },
  right: { 
    flex: 1, 
    padding: 20, 
    overflowY: 'auto',
    height: 'calc(100vh - 60px)'
  },
  placeholder: { 
    color: '#9ca3af', 
    fontSize: 18, 
    marginTop: 80, 
    textAlign: 'center' 
  },
  selfNote: { 
    background: '#fef3c7', 
    padding: 14, 
    borderRadius: 10, 
    marginBottom: 16, 
    color: '#92400e', 
    fontSize: 15,
    border: '1px solid #fde68a'
  },
  loading: { padding: 40, textAlign: 'center', color: '#6b7280' },
  backBtn: {
    display: 'none',
    width: '100%',
    padding: '14px 20px',
    background: '#f1f5f9',
    border: 'none',
    borderBottom: '1px solid #e2e8f0',
    fontSize: 15,
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
    textAlign: 'left',
    minHeight: 48
  },
};

