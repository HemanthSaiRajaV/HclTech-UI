const BASE = '/api'; // proxied to http://localhost:5000

// ── Employees ──────────────────────────────────────────
export const createEmployee = (data) =>
  fetch(`${BASE}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const getAllEmployees = () =>
  fetch(`${BASE}/employees`).then((r) => r.json());

// ── Feedback ───────────────────────────────────────────
export const submitFeedback = (data) =>
  fetch(`${BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const getFeedbackReceived = (employeeId) =>
  fetch(`${BASE}/feedback/received/${employeeId}`).then((r) => r.json());

export const getAverageRating = (employeeId) =>
  fetch(`${BASE}/feedback/average/${employeeId}`).then((r) => r.json());

export const deleteFeedback = (feedbackId, userId) =>
  fetch(`${BASE}/feedback/${feedbackId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }).then((r) => r.json());
