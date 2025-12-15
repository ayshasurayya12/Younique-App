

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = "http://localhost:3000/products";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: 0,
    isFeatured: false,
  });

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();

      setFormData({
        ...data,
        stock: data.stock ?? 0,
        isFeatured: data.isFeatured ?? false,
      });

    } catch (err) {
      toast.error("Product not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock" ? parseInt(value) : value === "true" ? true : value === "false" ? false : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        inStock: formData.stock > 0,
      };

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Product updated");
      navigate("/admin/products");
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading product...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#B37869]">Edit Product</h1>
        <Link to="/admin/products" className="text-sm text-gray-600 hover:text-[#B37869]">
          ← Back to Products
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 space-y-5 border-t-4 border-[#B37869]"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input type="text" name="category" required value={formData.category} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input type="number" name="price" min="0" value={formData.price} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input type="text" name="image" value={formData.image} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock Quantity</label>
          <input type="number" name="stock" min="0" value={formData.stock} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Featured Product</label>
          <select name="isFeatured" value={formData.isFeatured} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-[#B37869] text-white rounded-lg text-sm font-medium hover:bg-[#C58B7A] disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
