import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:3000";

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    restock_level: "",
  });

  // Load items from backend on first render
  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/items`);
        const json = await res.json();

        if (!res.ok || json.status !== "ok") {
          throw new Error(json.message || "Failed to load items");
        }

        // your API returns { status: "ok", data: [...] }
        setItems(json.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  async function handleAddItem(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category || "Uncategorized",
          restock_level: Number(form.restock_level),
        }),
      });

      const json = await res.json();
      if (!res.ok || json.status !== "ok") {
        throw new Error(json.message || "Failed to add item");
      }

      // Backend returns { status, message, data: { ...newItem } }
      const newItem = json.data;
      setItems((prev) => [...prev, newItem]);

      setForm({ name: "", category: "", restock_level: "" });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: "1.5rem", fontFamily: "system-ui" }}>
      <h1>MiniStock – Inventory</h1>

      <p>Backend: {API_BASE}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Add New Item</h2>
        <form
          onSubmit={handleAddItem}
          style={{ display: "grid", gap: "0.5rem", maxWidth: 400 }}
        >
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            placeholder="Restock level"
            type="number"
            min="0"
            value={form.restock_level}
            onChange={(e) =>
              setForm({ ...form, restock_level: e.target.value })
            }
            required
          />
          <button type="submit">Add Item</button>
        </form>
      </section>

      <section>
        <h2>Current Items</h2>
        {loading ? (
          <p>Loading items…</p>
        ) : items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Restock Level</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td>{it.category}</td>
                  <td>{it.stock_quantity}</td>
                  <td>{it.restock_level}</td>
                  <td>{it.last_updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
