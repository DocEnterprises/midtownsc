import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Product } from "./types";
import { productService } from "../../services/admin/productService";
import ProductForm from "./ProductForm";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash, Search, ArrowUpDown } from "lucide-react";

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsData = await productService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (product: Omit<Product, "id">) => {
    try {
      const newProduct = await productService.addProduct(product);
      setProducts((prev) => [...prev, newProduct]);
      toast.success("Product added successfully");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      const updatedProduct = await productService.updateProduct(
        product.id,
        product
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? updatedProduct : p))
      );
      toast.success("Product updated successfully");
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Product Manager</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-1/3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black-500 focus:border-transparent transition-all text-gray-900"
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white/10 rounded-lg border border-white/20 focus:border-purple-500">
              <tr>
                <th className="group px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer hover:bg-grey/10 border border-white/20 focus:border-purple-500">
                  <div className="flex items-center gap-2">
                    Name
                    <ArrowUpDown className="h-4 w-4 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="group px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer hover:bg-grey/10 border border-white/20 focus:border-purple-500">
                  <div className="flex items-center gap-2">
                    Price
                    <ArrowUpDown className="h-4 w-4 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="group px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer hover:bg-grey/10 border border-white/20 focus:border-purple-500">
                  <div className="flex items-center gap-2">
                    Category
                    <ArrowUpDown className="h-4 w-4 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/10 rounded-lg border border-white/20 focus:border-purple-500 divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-blue-200 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.image || "/placeholder.png"}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-black">
                          {product.strain || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${product.price}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-black-600 hover:text-black-900 transition-colors p-1 rounded-full hover:bg-black-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2D366D]  p-6 rounded-lg w-full max-w-lg">
            <ProductForm
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              onClose={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
              initialData={editingProduct}
              mode={editingProduct ? "edit" : "add"}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
