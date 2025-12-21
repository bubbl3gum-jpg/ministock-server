// src/api.js
const API_BASE = "http://localhost:3000";

async function handleResponse(res) {
  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // not JSON, ignore
  }

  if (!res.ok) {
    const msg =
      (data && data.message) ||
      text ||
      `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // keep if your backend uses cookies/sessions
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
}

export async function register({ email, password }) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // keep if your backend uses cookies/sessions
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
}

export async function getItems(search) {
  const url = search
    ? `${API_BASE}/api/items?search=${encodeURIComponent(search)}`
    : `${API_BASE}/api/items`;

  const res = await fetch(url, {
    credentials: "include",
  });
  return handleResponse(res);
}

export async function addItem(item) {
  const res = await fetch(`${API_BASE}/api/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(item),
  });
  return handleResponse(res);
}

export async function adjustItem(id, changeAmount) {
  const res = await fetch(`${API_BASE}/api/items/${id}/adjust`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ change_amount: changeAmount }),
  });
  return handleResponse(res);
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE}/api/items/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete failed with status ${res.status}`);
  }
}
