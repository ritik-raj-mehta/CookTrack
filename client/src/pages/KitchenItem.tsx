import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CiFilter, CiSearch } from "react-icons/ci";
import { FiCodesandbox, FiEdit3, FiX } from "react-icons/fi";
import type { AppDispatch, RootState } from "../stores/store";
import {
  addItemsToShoppingCart,
  deleteKitchenItem,
  fetchAllKitchenItemsByKitchenId,
  fetchShoppingItems,
  logItemAction,
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
  const [shoppingNotification, setShoppingNotification] = useState<string | null>(null);

  // Add low/out-of-stock item to shopping list
  const handleAddToShoppingList = async (item: ItemsTypes) => {
    try {
      await dispatch(
        addItemsToShoppingCart({
          name: item.productName,
          neededQuantity: 1,
          unit: item.unit || "Pieces",
          notes: `Restock needed for ${item.productName} (${item.category || "Pantry"})`,
        })
      ).unwrap();
      setShoppingNotification(`Added "${item.productName}" to market list!`);
      setTimeout(() => setShoppingNotification(null), 3500);
    } catch (err) {
      console.error("Failed to add to shopping list:", err);
    }
  };

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
      dispatch(fetchShoppingItems());
    }
  }, [dispatch, kitchenId]);

  // Handle Delete Trigger (Opens Popup)
  const handleDeleteTrigger = (item: ItemsTypes) => {
    setItemToDelete(item);
  };

  // Confirm Delete Action (Silently removes item without logging)
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

  // Handle logging item as consumed or wasted
  const handleLogConsumption = async (action: "consumed" | "wasted") => {
    if (!itemToDelete?._id) return;
    setIsDeleting(true);
    try {
      await dispatch(
        logItemAction({
          itemId: itemToDelete._id,
          action,
          quantityUsed: itemToDelete.quantity || 1,
        })
      ).unwrap();
      setShoppingNotification(
        action === "consumed"
          ? `🍽️ Logged "${itemToDelete.productName}" as consumed! Savings tracked.`
          : `🗑️ Logged "${itemToDelete.productName}" as spoiled to help reduce future waste.`
      );
      setTimeout(() => setShoppingNotification(null), 4000);
      setItemToDelete(null);
    } catch (err) {
      console.error("Failed to log action:", err);
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
    <div className="w-full max-w-full bg-slate-50 min-h-screen relative overflow-x-hidden">
      {/* HEADER */}
      <div className="bg-white py-3 sm:py-4 border-b border-gray-100 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex gap-2.5 sm:gap-3 items-center min-w-0">
          <div className="bg-emerald-100 text-xl sm:text-2xl p-2 sm:p-2.5 rounded-xl text-emerald-800 shrink-0">
            <FiCodesandbox />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight truncate">
              Pantry Inventory
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500">
              Items in Pantry ({filteredItems.length})
            </p>
          </div>
        </div>

        <NavLink
          className="self-stretch sm:self-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-95 text-white py-2.5 px-4 rounded-xl shadow-xs font-bold text-xs sm:text-sm transition hover-lift text-center"
          to="/additemstokitchen"
        >
          + Restock Item
        </NavLink>
      </div>

      <div className="px-3 sm:px-6 lg:px-8 py-2">
        {/* FILTER BOX */}
        <div className="bg-white my-3 sm:my-6 font-semibold p-3.5 sm:p-6 rounded-2xl space-y-3 sm:space-y-4 shadow-2xs border border-gray-100">
          <div className="flex items-center space-x-2 text-slate-800">
            <CiFilter className="text-xl sm:text-2xl text-emerald-600" />
            <h3 className="text-base sm:text-lg font-bold">Filter & Search</h3>
          </div>

          <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-4">
            {/* Search */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 flex items-center space-x-2 flex-1 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-600 transition">
              <CiSearch className="text-lg sm:text-xl text-gray-500 shrink-0" />
              <input
                type="text"
                className="outline-none w-full bg-transparent text-xs sm:text-sm font-normal text-gray-800 placeholder-gray-400"
                placeholder="Search by product name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
              {/* Category Filter */}
              <select
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:bg-white transition text-gray-700 font-medium truncate"
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
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:bg-white transition text-gray-700 font-medium truncate"
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
          {shoppingNotification && (
            <div className="mb-4 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-sm font-semibold animate-fadeIn">
              <span>{shoppingNotification}</span>
              <NavLink
                to="/additemstoshoppingcart"
                className="underline text-emerald-100 hover:text-white ml-3 text-xs"
              >
                View Shopping List →
              </NavLink>
            </div>
          )}

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
              onAddToShoppingList={handleAddToShoppingList}
            />
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FINISH / CONSUME OR REMOVE MODAL                                          */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 border border-gray-100 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-xl shadow-xs">
                  🍽️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Finish or Remove Item</h3>
                  <p className="text-xs text-gray-500">Track food usage for kitchen insights</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <FiX />
              </button>
            </div>

            <div className="bg-slate-50 border border-gray-200/80 rounded-xl p-3.5 text-xs text-gray-700">
              <p>
                How was <strong className="text-gray-900 font-semibold">"{itemToDelete.productName}"</strong>{" "}
                ({itemToDelete.quantity} {itemToDelete.unit}) used?
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Consumed */}
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleLogConsumption("consumed")}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-xs transition hover-lift cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <span>🍽️</span>
                  <span>Used Up / Consumed</span>
                </span>
                <span className="text-[11px] font-normal bg-emerald-600/60 px-2 py-0.5 rounded-md">
                  +Savings &amp; Eco Score
                </span>
              </button>

              {/* Option 2: Spoiled / Wasted */}
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleLogConsumption("wasted")}
                className="w-full py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 font-bold text-xs sm:text-sm flex items-center justify-between transition hover-lift cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <span>🗑️</span>
                  <span>Expired / Spoiled</span>
                </span>
                <span className="text-[11px] font-medium text-amber-800">
                  Track food waste
                </span>
              </button>

              {/* Option 3: Delete silently */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="text-xs text-gray-400 hover:text-red-600 font-semibold transition cursor-pointer"
                >
                  Just remove without logging
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setItemToDelete(null)}
                  className="text-xs text-gray-500 hover:text-gray-800 font-bold transition cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT ITEM POPUP MODAL                                                     */}
      {/* ========================================================================= */}
      {itemToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto my-auto">
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
