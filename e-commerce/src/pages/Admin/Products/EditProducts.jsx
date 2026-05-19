import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getImageSrc } from "../../../utils/imageHelper";
import client from "../../../api/client";

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        title: "", description: "", price: "",
        category: "", stock: 0, is_featured: false, image: "",
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [productRes, catRes] = await Promise.all([
                    client.get(`/admin/products/${id}/`),
                    client.get('/categories/'),
                ]);
                const p = productRes.data;
                setFormData({
                    title: p.title,
                    description: p.description,
                    price: p.price,
                    category: p.category?.name || '',
                    stock: p.stock,
                    is_featured: p.is_featured,
                    image: p.image,
                });
                setImagePreview(getImageSrc(p.image));
                setCategories(catRes.data);
            } catch {
                toast.error("Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stock' ? parseInt(value)
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
            await client.patch(`/admin/products/${id}/`, {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
            });

            if (imageFile) {
                const imgForm = new FormData();
                imgForm.append('image', imageFile);
                await client.post(`/admin/products/${id}/upload-image/`, imgForm, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            toast.success("Product updated!");
            navigate("/admin/products");
        } catch {
            toast.error("Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-center py-10">Loading...</p>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#B37869]">Edit Product</h1>
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
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Price (₹)</label>
                        <input type="number" name="price" min="0" step="0.01"
                            value={formData.price} onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Stock</label>
                        <input type="number" name="stock" min="0"
                            value={formData.stock} onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" rows="4" value={formData.description}
                        onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Product Image</label>
                    {imagePreview && (
                        <img src={imagePreview} alt="Current"
                            className="mb-3 w-32 h-32 object-contain border rounded-lg" />
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50" />
                    <p className="text-xs text-gray-400 mt-1">Leave empty to keep current image</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Featured</label>
                    <select name="is_featured" value={formData.is_featured}
                        onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-zinc-50">
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