import { useState, useEffect, useCallback } from 'react';
import { getAllEmployees, createEmployee } from '../api';

export default function EmployeeList({ onSelect, currentUser, setCurrentUser }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');        // for debounced search
  const [searchTerm, setSearchTerm] = useState('');      // debounced value
  const [form, setForm]           = useState({ name: '', email: '', department: '' });
  const [formError, setFormError] = useState('');
  const [pressedBtn, setPressedBtn] = useState(null);    // Track pressed button for touch feedback

  // Fetch all employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Debounce search input by 400ms (Bonus)
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEmployees = async () => {
    setLoading(true);
    const data = await getAllEmployees();
    setEmployees(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    const { name, email, department } = form;
    if (!name || !email || !department) {
      setFormError('All fields are required');
      return;
    }
    setFormError('');
    const res = await createEmployee(form);
    if (res.error) { setFormError(res.error); return; }
    setForm({ name: '', email: '', department: '' });
    fetchEmployees(); // refresh list
  };

  // Filter by debounced search term
  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Touch event handlers for button feedback
  const handleTouchStart = (btnId) => setPressedBtn(btnId);
  const handleTouchEnd = () => setPressedBtn(null);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>👥 Employees</h2>

      {/* Search with debounce - Touch optimized */}
      <input
        style={styles.input}
        placeholder="Search by name or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Create Employee Form - Touch optimized */}
      <div style={styles.form}>
        <h4 style={styles.formTitle}>Add Employee</h4>
        {['name', 'email', 'department'].map((field) => (
          <input
            key={field}
            style={styles.input}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        ))}
        {formError && <p style={styles.error}>{formError}</p>}
        <button 
          style={{
            ...styles.btn,
            transform: pressedBtn === 'add' ? 'scale(0.97)' : 'scale(1)',
            boxShadow: pressedBtn === 'add' ? '0 1px 4px rgba(16, 185, 129, 0.2)' : '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}
          onTouchStart={() => handleTouchStart('add')}
          onTouchEnd={handleTouchEnd}
          onClick={handleCreate}
        >
          ➕ Add Employee
        </button>
      </div>

      {/* Employee List - Touch optimized */}
      {loading ? <p style={styles.loadingText}>Loading...</p> : (
        <ul style={styles.list}>
          {filtered.map((emp) => (
            <li
              key={emp._id}
              style={{
                ...styles.listItem,
                background: currentUser?._id === emp._id ? '#dbeafe' : '#fff',
              }}
            >
              <div style={styles.empInfo}>
                <div style={styles.empName}>{emp.name}</div>
                <div style={styles.empDept}>{emp.department}</div>
                <div style={styles.empEmail}>{emp.email}</div>
              </div>
              <div style={styles.btnGroup}>
                {/* Set as current logged-in user - Touch optimized */}
                <button 
                  style={{
                    ...styles.smallBtn,
                    transform: pressedBtn === `me-${emp._id}` ? 'scale(0.95)' : 'scale(1)',
                  }}
                  onTouchStart={() => handleTouchStart(`me-${emp._id}`)}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => setCurrentUser(emp)}
                >
                  {currentUser?._id === emp._id ? '✅ Me' : 'Set as Me'}
                </button>
                {/* View feedback for this employee - Touch optimized */}
<button 
                  style={{
                    ...styles.smallBtn, 
                    background: '#22c55e', 
                    color: '#fff',
                    transform: pressedBtn === `view-${emp._id}` ? 'scale(0.95)' : 'scale(1)',
                  }}
                  onTouchStart={() => handleTouchStart(`view-${emp._id}`)}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => onSelect(emp)}
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: { 
    padding: 20, 
    maxWidth: 500, 
    background: '#fff', 
    borderRadius: 12, 
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    margin: '0 0 16px 0',
    fontSize: 22,
    fontWeight: 600,
    color: '#1f2937'
  },
  input: { 
    display: 'block', 
    width: '100%', 
    padding: '14px 16px',       // Increased from 10px 14px
    margin: '8px 0',           // Increased margin
    borderRadius: 10,          // Slightly larger border radius
    border: '1px solid #d1d5db', 
    boxSizing: 'border-box',
    fontSize: 16,               // Increased from 14 for better mobile readability
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    touchAction: 'manipulation'  // Improves touch response
  },
  form: { 
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
    padding: 16, 
    borderRadius: 10, 
    marginBottom: 16,
    border: '1px solid #e2e8f0'
  },
  formTitle: {
    margin: '0 0 12px 0',
    fontSize: 16,
    fontWeight: 600,
    color: '#334155'
  },
  btn: { 
    width: '100%',              // Full width for easier touch
    padding: '14px 20px',       // Increased from 10px 20px
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
    color: '#fff', 
    border: 'none', 
    borderRadius: 10,           // Slightly larger
    cursor: 'pointer', 
    marginTop: 10,              // Increased margin
    fontWeight: 600,           // Slightly bolder
    fontSize: 16,               // Increased from 14
    transition: 'transform 0.1s, box-shadow 0.1s',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    touchAction: 'manipulation',
    minHeight: 48               // Minimum touch target
  },
  smallBtn: { 
    padding: '12px 16px',       // Increased from 6px 12px
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: 8,            // Slightly larger
    cursor: 'pointer', 
    marginLeft: 6, 
    fontSize: 14,               // Increased from 12
    fontWeight: 500,
    color: '#475569',
    transition: 'background 0.1s, transform 0.1s',
    touchAction: 'manipulation',
    minHeight: 44,              // Minimum 44px touch target
    minWidth: 80                // Minimum width for better touch
  },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16,                // Increased from 14
    marginBottom: 12,          // Increased from 10
    borderRadius: 12,          // Slightly larger
    border: '1px solid #f1f5f9',
    background: '#fff',
    transition: 'box-shadow 0.2s, transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    touchAction: 'manipulation'
  },
  empInfo: {
    flex: 1,
    minWidth: 0                // Prevents overflow
  },
  btnGroup: { display: 'flex', gap: 6 },
  error: { color: '#ef4444', fontSize: 14, margin: '6px 0' },
  empName: { fontSize: 16, fontWeight: 600, color: '#1e293b' },
  empDept: { fontSize: 14, color: '#64748b', marginTop: 4 },
  empEmail: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  loadingText: { color: '#64748b', fontSize: 15 },
};

