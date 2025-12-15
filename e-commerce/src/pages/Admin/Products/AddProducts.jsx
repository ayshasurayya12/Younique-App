import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = "http://localhost:3000/products";

// ✅ Fixed category list
const CATEGORIES = [
  "Cleanser",
  "Moisturizer",
  "Serum",
  "Sunscreen",
  "Toner",
  "Face Mask",
  "Eye Cream"
];

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: 0,
    isFeatured: false
  });

  const [saving, setSaving] = useState(false);

  // ✅ Handles text, number & boolean properly
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "stock"
          ? Number(value)
          : value === "true"
          ? true
          : value === "false"
          ? false
          : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        inStock: Number(formData.stock) > 0
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create product");

      toast.success("Product added successfully 🎉");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product ❌");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#B37869]">
          Add Product
        </h1>

        <Link
          to="/admin/products"
          className="text-sm text-gray-600 hover:text-[#B37869]"
        >
          ← Back to Products
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 space-y-5 border-t-4 border-[#B37869]"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Price & Image */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              required
              value={formData.image}
              onChange={handleChange}
              placeholder="/src/assets/imgs/product.webp"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Stock Quantity
          </label>
          <input
            type="number"
            name="stock"
            min="0"
            required
            value={formData.stock}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50"
          />
        </div>

        {/* Featured */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Featured Product
          </label>
          <select
            name="isFeatured"
            value={formData.isFeatured}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-[#B37869] text-white rounded-lg text-sm font-medium hover:bg-[#C58B7A] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
