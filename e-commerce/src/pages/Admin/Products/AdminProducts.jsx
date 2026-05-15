import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getImageSrc } from "../../../utils/imageHelper";

const API_URL = "http://localhost:3000/products";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const loadProducts = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "priceLow":
        return a.price - b.price;
      case "priceHigh":
        return b.price - a.price;
      case "AtoZ":
        return a.title.localeCompare(b.title);
      case "ZtoA":
        return b.title.localeCompare(a.title);
      case "featured":
        return (b.isFeatured === true) - (a.isFeatured === true);
      case "stock":
        return (b.inStock === true) - (a.inStock === true);
      default:
        return 0;
    }
  });

  if (loading) {
    return <p className="text-center py-10">Loading...</p>;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#B37869]">
          Manage Products
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-lg shadow-sm text-sm w-full sm:w-60"
          />

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2 border rounded-lg shadow-sm text-sm w-full sm:w-auto"
          >
            <option value="default">Sort By</option>
            <option value="priceLow">Price: Low → High</option>
            <option value="priceHigh">Price: High → Low</option>
            <option value="AtoZ">Title: A → Z</option>
            <option value="ZtoA">Title: Z → A</option>
            <option value="featured">Featured First</option>
            <option value="stock">In-Stock First</option>
          </select>

          <Link
            to="/admin/products/add"
            className="px-4 py-2 bg-[#B37869] text-white rounded-lg hover:bg-[#C58B7A] w-full sm:w-auto text-center"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full bg-white shadow-md rounded-lg p-4">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Featured</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">
                  <img
                    src={getImageSrc(product.image)}
                    alt={product.title}
                    className="w-14 h-14 object-contain border rounded"
                  />
                </td>

                <td className="p-3 font-medium">
                  {product.title}
                </td>

                <td className="p-3">
                  {product.category}
                </td>

                <td className="p-3 font-semibold">
                  ₹{product.price}
                </td>

                {/* Stock Badge */}
                <td className="p-3">
                  <span
                    className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs font-semibold rounded-full min-w-[90px]
                      ${
                        product.inStock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {product.inStock ? "✔ In Stock" : "✖ Out"}
                  </span>
                </td>

                {/* Featured Badge */}
                <td className="p-3">
                  <span
                    className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs font-semibold rounded-full min-w-[90px]
                      ${
                        product.isFeatured
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {product.isFeatured ? "⭐ Featured" : "—"}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3 flex items-center justify-center gap-3">
                  <Link
                    to={`/admin/products/edit/${product.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {sortedProducts.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
