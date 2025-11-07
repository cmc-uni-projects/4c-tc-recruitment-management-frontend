import React, { useEffect, useState } from "react";
import axios from "axios";
import "./JobCategoryManager.css";

export default function JobCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", isPopular: false });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("accessToken");

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/job-categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/job-categories/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:8080/job-categories", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ name: "", description: "", isPopular: false });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa ngành nghề này?")) return;
    try {
      await axios.delete(`http://localhost:8080/job-categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  return (
    <div className="job-category-manager">
      <h2>Quản lý ngành nghề</h2>
      <form onSubmit={handleSubmit} className="category-form">
        <input
          type="text"
          placeholder="Tên ngành nghề"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={form.isPopular}
            onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
          />
          Ngành nghề phổ biến
        </label>
        <button type="submit">{editingId ? "Cập nhật" : "Thêm mới"}</button>
      </form>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="category-table">
          <thead>
            <tr>
              <th>Tên ngành nghề</th>
              <th>Mô tả</th>
              <th>Phổ biến</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.categoryId}>
                <td>{cat.name}</td>
                <td>{cat.description}</td>
                <td>{cat.isPopular ? "✅" : "❌"}</td>
                <td>
                  <button onClick={() => { setForm(cat); setEditingId(cat.categoryId); }}>Sửa</button>
                  <button onClick={() => handleDelete(cat.categoryId)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}