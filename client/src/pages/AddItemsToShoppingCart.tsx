import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCartPlus, FaFilePdf } from "react-icons/fa";
import {
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import type { AppDispatch, RootState } from "../stores/store";
import {
  addItemsToShoppingCart,
  clearKitchenError,
  clearKitchenMessage,
  deleteShoppingItem,
  fetchKitchenData,
  fetchShoppingItems,
  toggleShoppingItemBought,
} from "../stores/slices/KitchenSlice";
import type { ShoppingItem, ShoppingItemInput } from "../types/KitchenTypes";

export type shoppingItemTypes = ShoppingItemInput;

const AddItemsToShoppingCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { kitchenId, userId, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { shoppingItems, kitchenData, loading } = useSelector(
    (state: RootState) => state.kitchen
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "bought">("all");
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formItem, setFormItem] = useState<ShoppingItemInput>({
    name: "",
    neededQuantity: 1,
    unit: "Pieces",
    notes: "",
  });

  // Fetch shopping items and kitchen metadata on mount
  useEffect(() => {
    if (isAuthenticated && kitchenId) {
      dispatch(fetchShoppingItems());
      if (!kitchenData && userId) {
        dispatch(fetchKitchenData());
      }
    }

    return () => {
      dispatch(clearKitchenMessage());
      dispatch(clearKitchenError());
    };
  }, [dispatch, isAuthenticated, kitchenId, userId, kitchenData]);

  // Handle form field change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormItem((prev) => ({
      ...prev,
      [name]: name === "neededQuantity" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  // Submit new shopping item
  const handleAddItemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmedName = formItem.name.trim();
    if (!trimmedName) {
      setFormError("Please enter a product name.");
      return;
    }

    try {
      const result = await dispatch(
        addItemsToShoppingCart({
          ...formItem,
          name: trimmedName,
          neededQuantity: Number(formItem.neededQuantity) || 1,
        })
      ).unwrap();

      setFormSuccess(result?.message || "Item added to your shopping list!");
      setFormItem({
        name: "",
        neededQuantity: 1,
        unit: "Pieces",
        notes: "",
      });

      // Auto dismiss success notification after 4 seconds
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err) {
      setFormError(typeof err === "string" ? err : "Failed to add item to shopping list.");
    }
  };

  // Toggle item bought status
  const handleToggleBought = async (itemId: string) => {
    await dispatch(toggleShoppingItemBought(itemId));
  };

  // Delete item with confirmation
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (window.confirm(`Remove "${itemName}" from your shopping list?`)) {
      await dispatch(deleteShoppingItem(itemId));
    }
  };

  // Filtered and searched shopping items
  const filteredItems = useMemo(() => {
    const items = Array.isArray(shoppingItems) ? shoppingItems : [];
    return items.filter((item: ShoppingItem) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.trim().toLowerCase()));

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "pending" && !item.isBought) ||
        (filterStatus === "bought" && item.isBought);

      return matchesSearch && matchesStatus;
    });
  }, [shoppingItems, searchTerm, filterStatus]);

  // Counts
  const totalCount = shoppingItems.length;
  const pendingCount = shoppingItems.filter((i) => !i.isBought).length;
  const boughtCount = shoppingItems.filter((i) => i.isBought).length;

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 3600 * 24));
    if (diffDays <= 0) {
      const diffHours = Math.floor(diffMs / (1000 * 3600));
      if (diffHours <= 0) return "Just now";
      if (diffHours === 1) return "1 hr ago";
      return `${diffHours} hrs ago`;
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Generate and download PDF
  const handleDownloadPDF = () => {
    if (shoppingItems.length === 0) {
      alert("Your shopping list is empty. Add some items first before downloading!");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // Header banner
    doc.setFillColor(34, 197, 94); // emerald-500
    doc.rect(0, 0, pageWidth, 26, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CookTrack - Shopping List", margin, 17);

    // Generation Date
    const today = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${today}`, pageWidth - margin - 45, 17);

    // Kitchen Details
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const kitchenName = kitchenData?.kitchenName || "My Kitchen";
    doc.text(`Kitchen: ${kitchenName}`, margin, 36);

    // Summary stats
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Total: ${totalCount} items   |   To Buy: ${pendingCount}   |   Purchased: ${boughtCount}`,
      margin,
      43
    );

    // Table Header
    let y = 52;
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 9, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);

    const colStatus = margin + 3;
    const colName = margin + 28;
    const colQty = margin + 95;
    const colNotes = margin + 130;

    doc.text("Status", colStatus, y + 1);
    doc.text("Item Name", colName, y + 1);
    doc.text("Quantity", colQty, y + 1);
    doc.text("Notes", colNotes, y + 1);

    y += 8;

    // Table Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    shoppingItems.forEach((item, index) => {
      // Check page break
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;

        // Re-draw table header on new page
        doc.setFillColor(243, 244, 246);
        doc.rect(margin, y - 5, pageWidth - margin * 2, 9, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text("Status", colStatus, y + 1);
        doc.text("Item Name", colName, y + 1);
        doc.text("Quantity", colQty, y + 1);
        doc.text("Notes", colNotes, y + 1);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
      }

      const nameLines = doc.splitTextToSize(item.name || "-", 62);
      const notesLines = doc.splitTextToSize(item.notes || "-", 48);
      const rowLines = Math.max(nameLines.length, notesLines.length, 1);
      const rowHeight = rowLines * 5 + 4;

      // Alternating row background
      if (index % 2 === 1) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, y - 4, pageWidth - margin * 2, rowHeight, "F");
      }

      // Checkbox / Status
      if (item.isBought) {
        doc.setTextColor(34, 197, 94);
        doc.text("[x] Bought", colStatus, y);
      } else {
        doc.setTextColor(234, 88, 12);
        doc.text("[ ] To Buy", colStatus, y);
      }

      // Name
      if (item.isBought) {
        doc.setTextColor(156, 163, 175);
      } else {
        doc.setTextColor(17, 24, 39);
      }
      doc.text(nameLines, colName, y);

      // Quantity
      doc.setTextColor(55, 65, 81);
      doc.text(`${item.neededQuantity || 1} ${item.unit || "Pieces"}`, colQty, y);

      // Notes
      doc.setTextColor(item.notes ? 75 : 180, item.notes ? 85 : 180, item.notes ? 99 : 180);
      doc.text(notesLines, colNotes, y);

      // Divider line
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y + rowHeight - 4, pageWidth - margin, y + rowHeight - 4);

      y += rowHeight;
    });

    // Page numbering
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Generated by CookTrack - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    }

    const safeKitchen = (kitchenData?.kitchenName || "Kitchen").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`${safeKitchen}_Shopping_List_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="bg-gray-100 w-full min-h-screen">
      {/* Top Header Bar */}
      <div className="bg-white py-3 border-b border-black/10 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-x-4 items-center">
          <div className="bg-green-100 text-2xl p-2.5 rounded-full text-green-700 shadow-sm">
            <FaCartPlus />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold text-amber-950">
              Shopping List
            </h1>
            <p className="text-sm font-medium opacity-80">
              Manage items needed for {kitchenData?.kitchenName || "your kitchen"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-black py-2 px-4 rounded-lg font-semibold text-sm shadow-sm transition cursor-pointer"
            title="Download Shopping List as PDF"
          >
            <FaFilePdf className="text-red-500 text-base" />
            Download PDF
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-sm transition cursor-pointer"
          >
            {showAddForm ? <FiX className="text-base" /> : <FiPlus className="text-base" />}
            {showAddForm ? "Close Form" : "+ Add Item"}
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Needed Items
              </p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalCount}</h3>
              <p className="text-xs text-gray-400 mt-0.5">In your shopping cart</p>
            </div>
            <div className="bg-blue-50 text-blue-600 p-3 rounded-full text-xl">
              <FaCartPlus />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                To Buy (Pending)
              </p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">{pendingCount}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Still need to purchase</p>
            </div>
            <div className="bg-orange-50 text-orange-600 p-3 rounded-full text-xl">
              <FiCircle />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                Purchased (Bought)
              </p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{boughtCount}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Completed items</p>
            </div>
            <div className="bg-green-50 text-green-600 p-3 rounded-full text-xl">
              <FiCheckCircle />
            </div>
          </div>
        </div>

        {/* Add Item Form (Collapsible Card) */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Add New Shopping Item</h3>
                <p className="text-xs text-gray-500">
                  Specify details about the item needed for the kitchen
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            {formSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-lg flex items-center justify-between">
                <span>{formSuccess}</span>
                <button
                  type="button"
                  onClick={() => setFormSuccess(null)}
                  className="text-green-700 font-bold ml-2 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg flex items-center justify-between">
                <span>{formError}</span>
                <button
                  type="button"
                  onClick={() => setFormError(null)}
                  className="text-red-600 font-bold ml-2 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}

            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1 md:col-span-1">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="name">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
                    placeholder="e.g. Milk, Eggs, Flour"
                    onChange={handleInputChange}
                    value={formItem.name}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="neededQuantity">
                    Needed Quantity
                  </label>
                  <input
                    type="number"
                    id="neededQuantity"
                    name="neededQuantity"
                    min="1"
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
                    placeholder="Quantity"
                    onChange={handleInputChange}
                    value={formItem.neededQuantity || ""}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="unit">
                    Unit
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
                    onChange={handleInputChange}
                    value={formItem.unit}
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

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-700" htmlFor="notes">
                  Notes (Brand, preference, or store)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600 focus:bg-white transition"
                  placeholder="e.g. Whole milk only, organic if possible"
                  onChange={handleInputChange}
                  value={formItem.notes || ""}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2 px-6 rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {loading ? "Adding..." : "Add to List"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              placeholder="Search shopping items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-600 focus:bg-white transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                filterStatus === "all"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                filterStatus === "pending"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-orange-600"
              }`}
            >
              To Buy ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("bought")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                filterStatus === "bought"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              Purchased ({boughtCount})
            </button>
          </div>
        </div>

        {/* Shopping Items List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-amber-50 text-amber-700 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4">
                <FaCartPlus />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {searchTerm || filterStatus !== "all"
                  ? "No matching shopping items found"
                  : "Your shopping list is empty"}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search terms or filter to see more items."
                  : "Keep track of groceries, pantry essentials, and kitchen ingredients you need to buy."}
              </p>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
                >
                  <FiPlus className="text-base" /> Add First Item
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 md:px-6 flex items-center justify-between gap-4 transition hover:bg-gray-50 ${
                    item.isBought ? "bg-gray-50/60 opacity-80" : "bg-white"
                  }`}
                >
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleBought(item._id)}
                      className={`text-xl transition p-1 rounded-full cursor-pointer ${
                        item.isBought
                          ? "text-green-600 hover:text-green-700"
                          : "text-gray-300 hover:text-green-500"
                      }`}
                      title={item.isBought ? "Mark as needed" : "Mark as bought"}
                    >
                      {item.isBought ? (
                        <FiCheckCircle className="fill-green-100 text-green-600" />
                      ) : (
                        <FiCircle />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-base transition ${
                            item.isBought
                              ? "line-through text-gray-400"
                              : "text-gray-900"
                          }`}
                        >
                          {item.name}
                        </span>

                        {item.isBought ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <FiCheck className="text-xs" /> Purchased
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            To Buy
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Quantity & Timestamp */}
                  <div className="flex items-center gap-4 text-right">
                    <div className="bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-lg text-sm font-semibold text-amber-900 whitespace-nowrap">
                      {item.neededQuantity} {item.unit}
                    </div>

                    <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                      <FiClock className="text-xs" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>

                    {/* Delete action */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item._id, item.name)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Delete item"
                    >
                      <FiTrash2 className="text-base" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddItemsToShoppingCart;
