import { useState, useEffect } from 'react';
import { getAllEmployees, createEmployee } from '../api';
import styles from '../styles/EmployeeList.module.css';

export default function EmployeeList({ onSelect, currentUser, setCurrentUser }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');        // for debounced search
  const [searchTerm, setSearchTerm] = useState('');      // debounced value
  const [form, setForm]           = useState({ name: '', email: '', department: '' });
  const [formError, setFormError] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    const data = await getAllEmployees();
    setEmployees(data);
    setLoading(false);
  };

  // Fetch all employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Debounce search input by 400ms (Bonus)
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

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
    <div className={styles.container}>
      <h2 className={styles.header}>👥 Employees</h2>

      {/* Search with debounce - Touch optimized */}
      <input
        className={styles.input}
        placeholder="Search by name or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Create Employee Form - Touch optimized */}
      <div className={styles.form}>
        <h4 className={styles.formTitle}>Add Employee</h4>
        {['name', 'email', 'department'].map((field) => (
          <input
            key={field}
            className={styles.input}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        ))}
        {formError && <p className={styles.error}>{formError}</p>}
        <button 
          className={styles.btn}
          onClick={handleCreate}
        >
          ➕ Add Employee
        </button>
      </div>

      {/* Employee List - Touch optimized */}
      {loading ? <p className={styles.loadingText}>Loading...</p> : (
        <ul className={styles.list}>
          {filtered.map((emp) => (
            <li
              key={emp._id}
              className={`${styles.listItem} ${currentUser?._id === emp._id ? styles.listItemSelected : ''}`}
            >
              <div className={styles.empInfo}>
                <div className={styles.empName}>{emp.name}</div>
                <div className={styles.empDept}>{emp.department}</div>
                <div className={styles.empEmail}>{emp.email}</div>
              </div>
              <div className={styles.btnGroup}>
                {/* Set as current logged-in user - Touch optimized */}
                <button 
                  className={styles.smallBtn}
                  onClick={() => setCurrentUser(emp)}
                >
                  {currentUser?._id === emp._id ? '✅ Me' : 'Set as Me'}
                </button>
                {/* View feedback for this employee - Touch optimized */}
                <button 
                  className={`${styles.smallBtn} ${styles.smallBtnGreen}`}
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
