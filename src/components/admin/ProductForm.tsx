import React, { useEffect, useState } from "react";
import { Product } from "./types";

type Props = {
  onSubmit: (data: Omit<Product, "id"> | Product) => void;
  onClose: () => void;
  initialData?: Product | null;
  mode: "add" | "edit";
};

const CATEGORIES = [
  "Flower",
  "Vapes",
  "Edibles",
  "Pre-Rolls",
  "Concentrates",
  "Tinctures",
  "Topicals",
] as const;

const defaultValues: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0,
  category: "",
  image: "",
  stock: 0,
  thc: "",
  cbd: "",
  strain: undefined,
  effects: [],
  isAvailable: true,
};

const ProductForm: React.FC<Props> = ({
  onSubmit,
  onClose,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<Omit<Product, "id"> | Product>(
    initialData || defaultValues
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 text-white bg-[#2D366D] p-6 rounded-xl shadow-xl"
    >
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span
          className="bg-purple-600 text-white p-1.5 rounded-full flex items-center justify-center"
          title="Product Icon"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.5 5a.5.5 0 01.5-.5h14a.5.5 0 01.5.5V15a.5.5 0 01-.5.5h-14a.5.5 0 01-.5-.5V5zm1 .5v9h13v-9h-13z" />
          </svg>
        </span>
        {mode === "edit" ? "Edit Product" : "Add Product"}
      </h2>

      {[
        { id: "name", label: "Product Name", type: "text" },
        { id: "description", label: "Description", type: "textarea" },
        { id: "price", label: "Price ($)", type: "number", step: "0.01" },
        { id: "category", label: "Category", type: "select" },
        { id: "image", label: "Image URL", type: "text" },
        { id: "stock", label: "Stock Quantity", type: "number" },
        { id: "thc", label: "THC Content", type: "text" },
        { id: "cbd", label: "CBD Content", type: "text" },
        { id: "strain", label: "Strain", type: "text" },
      ].map(({ id, label, type, step }) => (
        <div className="space-y-1" key={id}>
          <label htmlFor={id} className="block text-sm text-gray-300">
            {label}
          </label>
          {type === "textarea" ? (
            <textarea
              id={id}
              name={id}
              value={(formData as any)[id]}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 bg-[#1E2644] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : type === "select" ? (
            <select
              id={id}
              name={id}
              value={(formData as any)[id]}
              onChange={handleChange}
              className="w-full p-2 bg-[#1E2644] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={id}
              name={id}
              type={type}
              value={(formData as any)[id]}
              onChange={handleChange}
              step={step}
              placeholder={`Enter ${label.toLowerCase()}`}
              className="w-full p-2 bg-[#1E2644] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          )}
        </div>
      ))}

      <div className="space-y-1">
        <label htmlFor="effects" className="block text-sm text-gray-300">
          Effects (comma separated)
        </label>
        <input
          id="effects"
          name="effects"
          value={(formData.effects || []).join(", ")}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              effects: e.target.value.split(",").map((str) => str.trim()),
            }))
          }
          placeholder="e.g. Relaxed, Happy, Sleepy"
          className="w-full p-2 bg-[#1E2644] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isAvailable"
          checked={formData.isAvailable}
          onChange={handleChange}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <label htmlFor="isAvailable" className="text-sm text-gray-300">
          Available for Purchase
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:ring-2 focus:ring-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500"
        >
          {mode === "edit" ? "Update" : "Add"} Product
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
