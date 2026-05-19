import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../../../api/client";

const AddProduct = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "", description: "", price: "",
        category: "", stock: 0, is_featured: false,
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await client.get('/categories/');
                setCategories(res.data);
            } catch {
                console.error('Failed to load categories');
            }
        };
        loadCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stock' ? Number(value)
                : value === 'true' ? true
                : value === 'false' ? false
                : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // create product first
            const res = await client.post('/admin/products/', {
                ...formData,
                price: Number(formData.price),
            });

            const newProductId = res.data.id;

            // upload image if selected
            if (imageFile) {
                const imgForm = new FormData();
                imgForm.append('image', imageFile);
                await client.post(`/admin/products/${newProductId}/upload-image/`, imgForm, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            toast.success("Product added successfully!");
            navigate("/admin/products");
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to add product");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#B37869]">Add Product</h1>
                <Link to="/admin/products" className="text-sm text-gray-600 hover:text-[#B37869]">← Back</Link>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 space-y-5 border-t-4 border-[#B37869]">

                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input type="text" name="title" required value={formData.title}
                        onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select name="category" required value={formData.category}
                        onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50">
                        <option value="">Select category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                        <option value="new">+ New Category</option>
                    </select>
                    {formData.category === 'new' && (
                        <input type="text" placeholder="Enter new category name"
                            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50 mt-2" />
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Price (₹)</label>
                        <input type="number" name="price" required min="0" step="0.01"
                            value={formData.price} onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                        <input type="number" name="stock" min="0" required
                            value={formData.stock} onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" rows="4" required value={formData.description}
                        onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Product Image</label>
                    <input type="file" accept="image/*" onChange={handleImageChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
                    {imagePreview && (
                        <img src={imagePreview} alt="Preview"
                            className="mt-3 w-32 h-32 object-contain border rounded-lg" />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Featured Product</label>
                    <select name="is_featured" value={formData.is_featured}
                        onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50">
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </div>

                <button type="submit" disabled={saving}
                    className="px-5 py-2 bg-[#B37869] text-white rounded-lg text-sm font-medium hover:bg-[#C58B7A] disabled:opacity-60">
                    {saving ? "Saving..." : "Add Product"}
                </button>
            </form>
        </div>
    );
};

export default AddProduct;