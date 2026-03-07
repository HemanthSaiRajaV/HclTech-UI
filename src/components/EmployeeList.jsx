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

  return (
    <div style={styles.container}>
      <h2>👥 Employees</h2>

      {/* Search with debounce */}
      <input
        style={styles.input}
        placeholder="Search by name or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Create Employee Form */}
      <div style={styles.form}>
        <h4>Add Employee</h4>
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
        <button style={styles.btn} onClick={handleCreate}>➕ Add</button>
      </div>

      {/* Employee List */}
      {loading ? <p>Loading...</p> : (
        <ul style={styles.list}>
          {filtered.map((emp) => (
            <li
              key={emp._id}
              style={{
                ...styles.listItem,
                background: currentUser?._id === emp._id ? '#dbeafe' : '#f9fafb',
              }}
            >
              <div>
                <strong>{emp.name}</strong> — {emp.department}
                <br />
                <small>{emp.email}</small>
              </div>
              <div style={styles.btnGroup}>
                {/* Set as current logged-in user */}
                <button style={styles.smallBtn} onClick={() => setCurrentUser(emp)}>
                  {currentUser?._id === emp._id ? '✅ Me' : 'Set as Me'}
                </button>
                {/* View feedback for this employee */}
                <button style={{ ...styles.smallBtn, background: '#6366f1', color: '#fff' }} onClick={() => onSelect(emp)}>
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
  container: { padding: 16, maxWidth: 480 },
  input: { display: 'block', width: '100%', padding: '8px 10px', margin: '6px 0', borderRadius: 6, border: '1px solid #d1d5db', boxSizing: 'border-box' },
  form: { background: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 12 },
  btn: { padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', marginTop: 4 },
  smallBtn: { padding: '4px 10px', background: '#e5e7eb', border: 'none', borderRadius: 4, cursor: 'pointer', marginLeft: 4, fontSize: 12 },
  list: { listStyle: 'none', padding: 0 },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, marginBottom: 8, borderRadius: 8, border: '1px solid #e5e7eb' },
  btnGroup: { display: 'flex' },
  error: { color: 'red', fontSize: 13 },
};
