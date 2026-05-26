import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import client from '../api/client';

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    target: "product",
    product: "",
    category: "",
    start_date: "",
    end_date: "",
  });

  const fetchOffers = async () => {
    try {
      const res = await client.get('admin/offers/');
      setOffers(res.data);
    } catch {
      toast.error("Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await client.get('products/');
      setProducts(res.data.results || res.data);
    } catch {
      toast.error("Failed to fetch products");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await client.get('categories/');
      setCategories(res.data.results || res.data);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        product: form.target === "product" ? form.product : null,
        category: form.target === "category" ? form.category : null,
      };
      await client.post('admin/offers/', payload);
      toast.success("Offer created!");
      setShowForm(false);
      setForm({
        name: "", description: "", discount_type: "percentage",
        discount_value: "", target: "product", product: "", category: "",
        start_date: "", end_date: "",
      });
      fetchOffers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create offer");
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await client.patch(`admin/offers/${id}/toggle/`, {});
      toast.success(res.data.message);
      fetchOffers();
    } catch {
      toast.error("Failed to toggle offer");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await client.delete(`admin/offers/${id}/`);
      toast.success("Offer deleted");
      fetchOffers();
    } catch {
      toast.error("Failed to delete offer");
    }
  };

  const handleRunNow = async () => {
    try {
      await client.post('admin/offers/run-now/', {});
      toast.success("Offer processing triggered!");
      setTimeout(fetchOffers, 2000);
    } catch {
      toast.error("Failed to trigger offer processing");
    }
  };

  if (loading) return <p className="text-gray-500">Loading offers...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#B37869]">Manage Offers</h2>
        <div className="flex gap-3">
          <button
            onClick={handleRunNow}
            className="px-4 py-2 bg-amber-100 text-amber-700 border border-amber-300 rounded-lg text-sm font-medium hover:bg-amber-200 transition"
          >
            ⚡ Run Now
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[#B37869] text-white rounded-lg font-medium hover:bg-[#9a6357] transition"
          >
            {showForm ? "Cancel" : "+ Add Offer"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#F7F2F0] border border-[#E5D5D0] rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Offer Name</label>
            <input
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Discount Type</label>
            <select
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.discount_type}
              onChange={e => setForm({ ...form, discount_type: e.target.value })}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Discount Value</label>
            <input
              type="number"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.discount_value}
              onChange={e => setForm({ ...form, discount_value: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Target</label>
            <select
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.target}
              onChange={e => setForm({ ...form, target: e.target.value })}
            >
              <option value="product">Specific Product</option>
              <option value="category">Entire Category</option>
            </select>
          </div>
          {form.target === "product" && (
            <div>
              <label className="text-sm font-medium text-gray-700">Product</label>
              <select
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.product}
                onChange={e => setForm({ ...form, product: e.target.value })}
                required
              >
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}
          {form.target === "category" && (
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Start Date & Time</label>
            <input
              type="datetime-local"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.start_date}
              onChange={e => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">End Date & Time</label>
            <input
              type="datetime-local"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.end_date}
              onChange={e => setForm({ ...form, end_date: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-6 py-2 bg-[#B37869] text-white rounded-lg font-medium hover:bg-[#9a6357] transition"
            >
              Create Offer
            </button>
          </div>
        </form>
      )}

      {offers.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No offers yet. Create one!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F2F0] text-left text-gray-600">
                <th className="px-4 py-3 rounded-tl-lg">Name</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <tr key={offer.id} className="border-t border-[#E5D5D0]">
                  <td className="px-4 py-3 font-medium">{offer.name}</td>
                  <td className="px-4 py-3">
                    {offer.discount_value}{offer.discount_type === "percentage" ? "%" : "₹"} off
                  </td>
                  <td className="px-4 py-3">
                    {offer.target === "product"
                      ? offer.product_detail?.title || "—"
                      : offer.category_detail?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(offer.start_date).toLocaleDateString()} →{" "}
                    {new Date(offer.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {offer.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                    ) : offer.is_expired ? (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">Expired</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Scheduled</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleToggle(offer.id)}
                      className="px-3 py-1 text-xs rounded-lg border border-[#B37869] text-[#B37869] hover:bg-[#F2E8E6] transition"
                    >
                      {offer.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="px-3 py-1 text-xs rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}