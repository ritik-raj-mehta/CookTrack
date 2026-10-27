import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CiFilter, CiSearch } from "react-icons/ci";
import { FiAlertTriangle, FiCodesandbox, FiEdit3, FiX } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import type { AppDispatch, RootState } from "../stores/store";
import {
  deleteKitchenItem,
  fetchAllKitchenItemsByKitchenId,
  updateKitchenItem,
} from "../stores/slices/KitchenSlice";
import ItemCard from "../components/ItemCard";
import type { ItemsTypes } from "../types/KitchenTypes";

const KitchenItem = () => {
  const { kitchenItems } = useSelector((state: RootState) => state.kitchen);
  const { kitchenId } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");

  // Delete Confirmation Popup State
  const [itemToDelete, setItemToDelete] = useState<ItemsTypes | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Item Popup State
  const [itemToEdit, setItemToEdit] = useState<ItemsTypes | null>(null);
  const [editFormData, setEditFormData] = useState<ItemsTypes>({
    productName: "",
    category: "",
    quantity: 0,
    unit: "Pieces",
    storageLocation: "",
    expiryDate: "",
    notes: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (kitchenId) {
      dispatch(fetchAllKitchenItemsByKitchenId());
    }
  }, [dispatch, kitchenId]);

  // Handle Delete Trigger (Opens Popup)
  const handleDeleteTrigger = (item: ItemsTypes) => {
    setItemToDelete(item);
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!itemToDelete?._id) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteKitchenItem(itemToDelete._id)).unwrap();
      setItemToDelete(null);
    } catch (err) {
      console.error("Failed to delete item:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Edit Trigger (Opens Edit Popup)
  const handleEditTrigger = (item: ItemsTypes) => {
    setItemToEdit(item);
    setEditFormData({
      _id: item._id,
      productName: item.productName || "",
      category: item.category || "Pantry Items",
      quantity: item.quantity ?? 1,
      unit: item.unit || "Pieces",
      storageLocation: item.storageLocation || "Pantry",
      expiryDate: item.expiryDate || "",
      notes: item.notes || "",
    });
    setEditError(null);
  };

  // Handle Edit Form Field Change
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemToEdit?._id) return;

    if (!editFormData.productName.trim()) {
      setEditError("Product name cannot be empty.");
      return;
    }

    setIsUpdating(true);
    setEditError(null);

    try {
      await dispatch(
        updateKitchenItem({
          itemId: itemToEdit._id,
          data: {
            ...editFormData,
            productName: editFormData.productName.trim(),
            quantity: Number(editFormData.quantity) || 0,
          },
        })
      ).unwrap();

      setItemToEdit(null);
    } catch (err) {
      setEditError(typeof err === "string" ? err : "Failed to update item.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ---------- FILTER LOGIC ----------
  const items = Array.isArray(kitchenItems) ? kitchenItems : [];
  const filteredItems = items.filter((item: ItemsTypes) => {
    const pName = (item.productName || "").toLowerCase();
    const cat = (item.category || "").toLowerCase();
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch = !search || pName.includes(search) || cat.includes(search);
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesUnit =
      !unitFilter || (item.unit || "").toLowerCase() === unitFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesUnit;
  });

  return (
    <div className="w-full bg-gray-100 min-h-screen relative">
      {/* HEADER */}
      <div className="bg-white py-3 border-b border-black/10 px-8 flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="bg-green-200 text-2xl p-2 rounded-full text-green-800">
            <FiCodesandbox />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold text-amber-950">
              My Kitchen Items
            </h1>
            <p className="text-sm font-medium opacity-85">
              Items in Kitchen Inventory ({filteredItems.length})
            </p>
          </div>
        </div>

        <NavLink
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-md font-semibold transition"
          to="/additemstokitchen"
        >
          + Add Product
        </NavLink>
      </div>

      <div className="px-8">
        {/* FILTER BOX */}
        <div className="bg-white my-6 font-semibold px-6 py-6 rounded-xl space-y-4 shadow-md">
          <div className="flex items-center space-x-2 text-slate-800">
            <CiFilter className="text-2xl" />
            <h3 className="text-xl">Filter & Search</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 flex items-center space-x-2 flex-1 focus-within:border-green-700 focus-within:ring-1 focus-within:ring-green-700">
              <CiSearch className="text-xl text-gray-500" />
              <input
                type="text"
                className="outline-none w-full bg-transparent text-sm font-normal"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              {/* Category Filter */}
              <select
                className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-700"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
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

              {/* Unit Filter */}
              <select
                className="bg-gray-50 border border-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-700"
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
              >
                <option value="">All Units</option>
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
        </div>

        {/* PRODUCT LIST */}
        <div className="my-6">
          {filteredItems.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl shadow-sm text-slate-500">
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm mt-1">
                Try adjusting your filters or search term, or add new items to your kitchen.
              </p>
              <NavLink
                to="/additemstokitchen"
                className="inline-block mt-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-600"
              >
                Add Your First Item
              </NavLink>
            </div>
          ) : (
            <ItemCard
              productData={filteredItems}
              onDelete={handleDeleteTrigger}
              onEdit={handleEditTrigger}
            />
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION POPUP MODAL                                           */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner">
              <FiAlertTriangle />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
              <p className="text-sm text-gray-600 px-2">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-gray-900">"{itemToDelete.productName}"</span>{" "}
                from your kitchen inventory?
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              This action cannot be undone and will permanently remove this item from your kitchen.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <MdDeleteOutline className="text-lg" />
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT ITEM POPUP MODAL                                                     */}
      {/* ========================================================================= */}
      {itemToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg text-lg">
                  <FiEdit3 />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Kitchen Item</h3>
                  <p className="text-xs text-gray-500">Update product information</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setItemToEdit(null)}
                className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Product Name */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-700" htmlFor="edit-productName">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="edit-productName"
                  name="productName"
                  required
                  value={editFormData.productName}
                  onChange={handleEditInputChange}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
                  placeholder="e.g. Basmati Rice, Olive Oil"
                />
              </div>

              {/* Category & Storage Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="edit-category">
                    Category
                  </label>
                  <select
                    id="edit-category"
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
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

                <div className="flex flex-col space-y-1">
                  <label
                    className="text-sm font-semibold text-gray-700"
                    htmlFor="edit-storageLocation"
                  >
                    Storage Location
                  </label>
                  <select
                    id="edit-storageLocation"
                    name="storageLocation"
                    value={editFormData.storageLocation}
                    onChange={handleEditInputChange}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
                  >
                    <option value="Pantry">Pantry</option>
                    <option value="Fridge">Fridge</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Spice Rack">Spice Rack</option>
                    <option value="Kitchen Cabinet">Kitchen Cabinet</option>
                    <option value="Countertop">Countertop</option>
                  </select>
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="edit-quantity">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="edit-quantity"
                    name="quantity"
                    min="0"
                    value={editFormData.quantity ?? ""}
                    onChange={handleEditInputChange}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="edit-unit">
                    Unit
                  </label>
                  <select
                    id="edit-unit"
                    name="unit"
                    value={editFormData.unit}
                    onChange={handleEditInputChange}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
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

              {/* Expiry Date */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-700" htmlFor="edit-expiryDate">
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="edit-expiryDate"
                  name="expiryDate"
                  value={editFormData.expiryDate}
                  onChange={handleEditInputChange}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-700" htmlFor="edit-notes">
                  Notes
                </label>
                <textarea
                  id="edit-notes"
                  name="notes"
                  rows={2}
                  value={editFormData.notes || ""}
                  onChange={handleEditInputChange}
                  placeholder="Optional details or brand notes..."
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setItemToEdit(null)}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isUpdating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenItem;
