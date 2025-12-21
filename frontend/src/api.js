// src/api.js
const API_BASE = "http://localhost:3000";

// --- HELPER: Get Token and create Headers ---
function getAuthHeaders() {
  const token = localStorage.getItem("token"); // We will save the token here on login
  const headers = {
    "Content-Type": "application/json",
  };
  
  // If we have a token, attach the "ID Card"
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

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
    
    // If the server says "Unauthorized" (401 or 403), log the user out automatically
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        // Optional: window.location.href = '/login'; 
    }
    
    throw new Error(msg);
  }

  return data;
}

// --- AUTH ---

export async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(res);
  
  // AUTOMATICALLY SAVE THE TOKEN HERE
  if (data.token) {
      localStorage.setItem("token", data.token);
  }
  
  return data;
}

export async function register({ email, password }) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
}

// --- ITEMS (Now using getAuthHeaders) ---

export async function getItems(search) {
  const url = search
    ? `${API_BASE}/api/items?search=${encodeURIComponent(search)}`
    : `${API_BASE}/api/items`;

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(), // <--- ATTATCHES THE TOKEN
  });
  return handleResponse(res);
}

export async function addItem(item) {
  const res = await fetch(`${API_BASE}/api/items`, {
    method: "POST",
    headers: getAuthHeaders(), // <--- ATTATCHES THE TOKEN
    body: JSON.stringify(item),
  });
  return handleResponse(res);
}

export async function adjustItem(id, changeAmount) {
  const res = await fetch(`${API_BASE}/api/items/${id}/adjust`, {
    method: "POST",
    headers: getAuthHeaders(), // <--- ATTATCHES THE TOKEN
    body: JSON.stringify({ change_amount: changeAmount }),
  });
  return handleResponse(res);
}

export async function deleteItem(id) {
  const res = await fetch(`${API_BASE}/api/items/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(), // <--- ATTATCHES THE TOKEN
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete failed with status ${res.status}`);
  }
}