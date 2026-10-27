import { useState } from "react";
import { FiCheck, FiCodesandbox, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../stores/store";
import { addKitchenItems } from "../stores/slices/KitchenSlice";
import type { ItemsTypes } from "../types/KitchenTypes";

const AddItemsToKitchen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.kitchen);

  const [kitchenItems, setKitchenItems] = useState<ItemsTypes>({
    productName: "",
    category: "Pantry Items",
    quantity: 1,
    unit: "Pieces",
    storageLocation: "Pantry",
    expiryDate: "",
    notes: "",
  });

  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleProductFormData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setKitchenItems((prev) => ({
      ...prev,
      [name]: name === "quantity" ? (value === "" ? 0 : Number(value)) : value,
    }));
    setFormError(null);
  };

  const handleKitchenItemForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmedName = kitchenItems.productName.trim();
    if (!trimmedName) {
      setFormError("Please enter a product name.");
      return;
    }

    try {
      const result = await dispatch(
        addKitchenItems({
          ...kitchenItems,
          productName: trimmedName,
          quantity: Number(kitchenItems.quantity) || 0,
        })
      ).unwrap();

      setFormSuccess(result?.message || "Product added to inventory successfully!");
      setKitchenItems({
        productName: "",
        category: "Pantry Items",
        quantity: 1,
        unit: "Pieces",
        storageLocation: "Pantry",
        expiryDate: "",
        notes: "",
      });

      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err) {
      setFormError(typeof err === "string" ? err : "Failed to add product to kitchen.");
    }
  };

  return (
    <div className="bg-slate-50 w-full min-h-screen">
      {/* Top Header */}
      <div className="bg-white py-4 border-b border-gray-100 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex gap-x-3.5 sm:gap-x-4 items-center">
          <div className="bg-emerald-100 text-emerald-700 text-2xl p-2 sm:p-2.5 rounded-2xl shadow-xs shrink-0">
            <FiCodesandbox />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
              Add New Product
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Stock items and track expiry in your kitchen inventory
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fadeIn">
        <form
          onSubmit={handleKitchenItemForm}
          className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6"
        >
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-xl font-bold text-gray-900">Product Information</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Fill in details about the item you want to add to your kitchen.
            </p>
          </div>

          {formSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <FiCheck className="text-base text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormSuccess(null)}
                className="text-emerald-700 font-bold ml-2 cursor-pointer"
              >
                <FiX />
              </button>
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between animate-fadeIn">
              <span>{formError}</span>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-red-700 font-bold ml-2 cursor-pointer"
              >
                <FiX />
              </button>
            </div>
          )}

          {/* Product Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="productName">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                required
                className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
                placeholder="e.g. Basmati Rice, Olive Oil"
                onChange={handleProductFormData}
                value={kitchenItems.productName}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition cursor-pointer"
                onChange={handleProductFormData}
                value={kitchenItems.category}
              >
                <option value="Fruits & Vegetable">Fruits & Vegetable</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Meat & Poultry">Meat & Poultry</option>
                <option value="Seafood">Seafood</option>
                <option value="Pantry Items">Pantry Items</option>
                <option value="Frozen Fruits">Frozen Fruits</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks">Snacks</option>
                <option value="Condiment & Sauces">Condiment & Sauces</option>
                <option value="Baking Supplies">Baking Supplies</option>
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="quantity">
                Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
                placeholder="Enter quantity"
                onChange={handleProductFormData}
                value={kitchenItems.quantity ?? ""}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="unit">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition cursor-pointer"
                onChange={handleProductFormData}
                value={kitchenItems.unit}
              >
                <option value="Pieces">Pieces</option>
                <option value="kg">kg</option>
                <option value="grams">grams</option>
                <option value="liters">liters</option>
                <option value="ml">ml</option>
                <option value="cups">cups</option>
                <option value="cans">cans</option>
                <option value="bottles">bottles</option>
                <option value="package">package</option>
              </select>
            </div>
          </div>

          {/* Storage Location & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="storageLocation">
                Storage Location
              </label>
              <select
                id="storageLocation"
                name="storageLocation"
                className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition cursor-pointer"
                onChange={handleProductFormData}
                value={kitchenItems.storageLocation}
              >
                <option value="Pantry">Pantry</option>
                <option value="Refrigerator">Refrigerator</option>
                <option value="Freezer">Freezer</option>
                <option value="Cupboard">Cupboard</option>
                <option value="Counter">Counter</option>
                <option value="Spice Rack">Spice Rack</option>
                <option value="Wine Rack">Wine Rack</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-semibold text-gray-700" htmlFor="expiryDate">
                Expiry Date
              </label>
              <input
                id="expiryDate"
                name="expiryDate"
                type="date"
                className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
                onChange={handleProductFormData}
                value={kitchenItems.expiryDate}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-semibold text-gray-700" htmlFor="notes">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition"
              placeholder="Brand preference, batch number, or cooking notes..."
              onChange={handleProductFormData}
              value={kitchenItems.notes}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer hover-lift"
            >
              {loading ? "Adding Product..." : "Add Product to Inventory"}
            </button>
            <button
              type="button"
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-sm transition cursor-pointer"
              onClick={() =>
                setKitchenItems({
                  productName: "",
                  category: "Pantry Items",
                  quantity: 1,
                  unit: "Pieces",
                  storageLocation: "Pantry",
                  expiryDate: "",
                  notes: "",
                })
              }
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemsToKitchen;
