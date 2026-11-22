import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCartPlus, FaFilePdf } from "react-icons/fa";
import {
  FiBox,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiEdit3,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import ThemeToggle from "../components/ThemeToggle";
import type { AppDispatch, RootState } from "../stores/store";
import {
  addKitchenItems,
  addItemsToShoppingCart,
  clearKitchenError,
  clearKitchenMessage,
  deleteShoppingItem,
  fetchKitchenData,
  fetchShoppingItems,
  toggleShoppingItemBought,
  updateShoppingItem,
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

  // Restock to Pantry Modal State
  const [restockModal, setRestockModal] = useState<{
    isOpen: boolean;
    item: ShoppingItem | null;
    productName: string;
    category: string;
    quantity: number;
    unit: string;
    storageLocation: string;
    expiryDate: string;
    notes: string;
  }>({
    isOpen: false,
    item: null,
    productName: "",
    category: "Pantry Items",
    quantity: 1,
    unit: "Pieces",
    storageLocation: "Pantry",
    expiryDate: "",
    notes: "",
  });
  const [isRestocking, setIsRestocking] = useState(false);

  // Helper: Compute future date for expiry presets
  const getFutureDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().slice(0, 10);
  };

  // Helper: Guess food category and storage location from product title
  const guessCategoryAndLocation = (name: string) => {
    const lower = name.toLowerCase();
    if (/milk|cheese|butter|yogurt|cream|curd|paneer|egg/.test(lower)) {
      return { category: "Dairy & Eggs", location: "Refrigerator" };
    }
    if (/apple|banana|tomato|onion|potato|spinach|carrot|lettuce|broccoli|cucumber|orange|lemon|fruit|vegetable/.test(lower)) {
      return { category: "Fruits & Vegetable", location: "Refrigerator" };
    }
    if (/chicken|beef|pork|mutton|fish|salmon|shrimp|meat|bacon|sausage/.test(lower)) {
      return { category: "Meat & Poultry", location: "Refrigerator" };
    }
    if (/ice cream|frozen|pea|nugget/.test(lower)) {
      return { category: "Frozen Fruits", location: "Freezer" };
    }
    if (/bread|bun|bagel|croissant|cake|muffin|flour/.test(lower)) {
      return { category: "Baking Supplies", location: "Pantry" };
    }
    if (/coffee|tea|juice|soda|cola|beer|wine|water/.test(lower)) {
      return { category: "Beverages", location: "Pantry" };
    }
    return { category: "Pantry Items", location: "Pantry" };
  };

  const openRestockModal = (item: ShoppingItem) => {
    const { category, location } = guessCategoryAndLocation(item.name);
    setRestockModal({
      isOpen: true,
      item,
      productName: item.name,
      category,
      quantity: item.neededQuantity || 1,
      unit: item.unit || "Pieces",
      storageLocation: location,
      expiryDate: getFutureDate(7), // Default +7 days
      notes: item.notes || "",
    });
  };

  const handleRestockSubmit = async (removeFromList: boolean) => {
    if (!restockModal.productName.trim()) return;
    setIsRestocking(true);
    try {
      await dispatch(
        addKitchenItems({
          productName: restockModal.productName.trim(),
          category: restockModal.category,
          quantity: Number(restockModal.quantity) || 1,
          unit: restockModal.unit,
          storageLocation: restockModal.storageLocation,
          expiryDate: restockModal.expiryDate,
          notes: restockModal.notes ? restockModal.notes.trim() : "",
        })
      ).unwrap();

      if (removeFromList && restockModal.item?._id) {
        await dispatch(deleteShoppingItem(restockModal.item._id));
        setFormSuccess(
          `Restocked "${restockModal.productName}" into pantry inventory and cleared from market list!`
        );
      } else {
        setFormSuccess(
          `Restocked "${restockModal.productName}" into pantry inventory!`
        );
      }

      setRestockModal((prev) => ({ ...prev, isOpen: false }));
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to restock item to pantry:", err);
      setFormError("Failed to add product to pantry inventory.");
    } finally {
      setIsRestocking(false);
    }
  };

  // Edit Shopping Item State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    item: ShoppingItem | null;
    name: string;
    neededQuantity: number;
    unit: string;
    notes: string;
  }>({
    isOpen: false,
    item: null,
    name: "",
    neededQuantity: 1,
    unit: "Pieces",
    notes: "",
  });
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [editItemError, setEditItemError] = useState<string | null>(null);

  const handleOpenEditModal = (item: ShoppingItem) => {
    setEditModal({
      isOpen: true,
      item,
      name: item.name || "",
      neededQuantity: item.neededQuantity || 1,
      unit: item.unit || "Pieces",
      notes: item.notes || "",
    });
    setEditItemError(null);
  };

  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.item?._id) return;
    const cleanName = editModal.name.trim();
    if (!cleanName) {
      setEditItemError("Product name cannot be empty.");
      return;
    }

    setIsUpdatingItem(true);
    setEditItemError(null);
    try {
      await dispatch(
        updateShoppingItem({
          itemId: editModal.item._id,
          data: {
            name: cleanName,
            neededQuantity: Number(editModal.neededQuantity) || 1,
            unit: editModal.unit,
            notes: editModal.notes ? editModal.notes.trim() : "",
          },
        })
      ).unwrap();

      setFormSuccess(`Updated "${cleanName}" successfully!`);
      setEditModal((prev) => ({ ...prev, isOpen: false }));
      setTimeout(() => setFormSuccess(null), 3500);
    } catch (err) {
      console.error("Failed to update item:", err);
      setEditItemError(typeof err === "string" ? err : "Failed to update item.");
    } finally {
      setIsUpdatingItem(false);
    }
  };

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
    const targetItem = shoppingItems.find((i) => i._id === itemId);
    await dispatch(toggleShoppingItemBought(itemId));

    // If item was previously pending, it is now marked as BOUGHT -> Trigger Restock Prompt!
    if (targetItem && !targetItem.isBought) {
      openRestockModal(targetItem);
    }
  };

  // Delete item with confirmation
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (window.confirm(`Remove "${itemName}" from your shopping list?`)) {
      await dispatch(deleteShoppingItem(itemId));
    }
  };

  const effectiveItems = useMemo(() => {
    return Array.isArray(shoppingItems) ? shoppingItems : [];
  }, [shoppingItems]);

  // Filtered and searched shopping items
  const filteredItems = useMemo(() => {
    return effectiveItems.filter((item: ShoppingItem) => {
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
  }, [effectiveItems, searchTerm, filterStatus]);

  // Counts
  const totalCount = effectiveItems.length;
  const pendingCount = effectiveItems.filter((i) => !i.isBought).length;
  const boughtCount = effectiveItems.filter((i) => i.isBought).length;

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
      alert("Your market list is empty. Add some items first before downloading!");
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
    doc.text("CookTrack - Market List", margin, 17);

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
    doc.save(`${safeKitchen}_Market_List_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 w-full min-h-screen transition-colors">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 py-4 border-b border-gray-100 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex gap-x-3.5 sm:gap-x-4 items-center">
          <div className="bg-green-100 dark:bg-emerald-950/60 text-2xl p-2 sm:p-2.5 rounded-2xl text-green-700 dark:text-emerald-400 shadow-2xs shrink-0">
            <FaCartPlus />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white">
              Market List
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">
              Manage items needed for {kitchenData?.kitchenName || "your kitchen"}'s market run
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="hidden md:flex items-center shrink-0">
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600 active:scale-95 text-gray-700 dark:text-slate-200 hover:text-black dark:hover:text-white py-2.5 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm shadow-2xs transition cursor-pointer"
            title="Download Market List as PDF"
          >
            <FaFilePdf className="text-red-500 text-base shrink-0" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white py-2.5 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer"
          >
            {showAddForm ? <FiX className="text-base shrink-0" /> : <FiPlus className="text-base shrink-0" />}
            <span>{showAddForm ? "Close Form" : "+ Add Item"}</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-12">
        {/* Quick Stats Cards: 3-column compact grid, no clipped labels */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 lg:p-5 rounded-xl shadow-2xs border border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Total Items
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white mt-0.5 sm:mt-1">{totalCount}</h3>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 p-2 sm:p-2.5 lg:p-3 rounded-full text-base sm:text-lg lg:text-xl shrink-0">
              <FaCartPlus />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 lg:p-5 rounded-xl shadow-2xs border border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                To Buy
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mt-0.5 sm:mt-1">{pendingCount}</h3>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 p-2 sm:p-2.5 lg:p-3 rounded-full text-base sm:text-lg lg:text-xl shrink-0">
              <FiCircle />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 lg:p-5 rounded-xl shadow-2xs border border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-green-600 dark:text-emerald-400 uppercase tracking-wider">
                Purchased
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-green-600 dark:text-emerald-400 mt-0.5 sm:mt-1">{boughtCount}</h3>
            </div>
            <div className="bg-green-50 dark:bg-emerald-950/50 text-green-600 dark:text-emerald-400 p-2 sm:p-2.5 lg:p-3 rounded-full text-base sm:text-lg lg:text-xl shrink-0">
              <FiCheckCircle />
            </div>
          </div>
        </div>

        {/* Add Item Form (Collapsible Card) */}
        {showAddForm && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-800 transition-all">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add New Market Item</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Specify details about the item needed for the kitchen
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            {formSuccess && (
              <div className="mb-4 bg-green-50 dark:bg-emerald-950/40 border border-green-200 dark:border-emerald-900/60 text-green-700 dark:text-emerald-300 text-sm px-4 py-2.5 rounded-lg flex items-center justify-between">
                <span>{formSuccess}</span>
                <button
                  type="button"
                  onClick={() => setFormSuccess(null)}
                  className="text-green-700 dark:text-emerald-400 font-bold ml-2 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}

            {formError && (
              <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm px-4 py-2.5 rounded-lg flex items-center justify-between">
                <span>{formError}</span>
                <button
                  type="button"
                  onClick={() => setFormError(null)}
                  className="text-red-600 dark:text-red-400 font-bold ml-2 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}

            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1 md:col-span-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-slate-300" htmlFor="name">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-green-600 focus:bg-white dark:focus:bg-slate-800 transition"
                    placeholder="e.g. Milk, Eggs, Flour"
                    onChange={handleInputChange}
                    value={formItem.name}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-slate-300" htmlFor="neededQuantity">
                    Needed Quantity
                  </label>
                  <input
                    type="number"
                    id="neededQuantity"
                    name="neededQuantity"
                    min="1"
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-green-600 focus:bg-white dark:focus:bg-slate-800 transition"
                    placeholder="Quantity"
                    onChange={handleInputChange}
                    value={formItem.neededQuantity || ""}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-slate-300" htmlFor="unit">
                    Unit
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-green-600 focus:bg-white dark:focus:bg-slate-800 transition"
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
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300" htmlFor="notes">
                  Notes (Brand, preference, or store)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-green-600 focus:bg-white dark:focus:bg-slate-800 transition"
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
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl shadow-2xs border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-colors">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-base pointer-events-none" />
            <input
              type="text"
              placeholder="Search shopping items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none focus:border-green-600 focus:bg-white dark:focus:bg-slate-800 transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto transition-colors">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`flex-1 md:flex-initial text-center px-3 py-2 text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer ${
                filterStatus === "all"
                  ? "bg-white dark:bg-slate-700 text-gray-800 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("pending")}
              className={`flex-1 md:flex-initial text-center px-3 py-2 text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer ${
                filterStatus === "pending"
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-2xs"
                  : "text-gray-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              To Buy ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("bought")}
              className={`flex-1 md:flex-initial text-center px-3 py-2 text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer ${
                filterStatus === "bought"
                  ? "bg-white dark:bg-slate-700 text-green-600 dark:text-emerald-400 shadow-2xs"
                  : "text-gray-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-emerald-400"
              }`}
            >
              Purchased ({boughtCount})
            </button>
          </div>
        </div>

        {/* Shopping Items List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4">
                <FaCartPlus />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {searchTerm || filterStatus !== "all"
                  ? "No matching market items found"
                  : "Your market list is empty"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
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
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className={`p-3.5 sm:p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition hover:bg-gray-50 dark:hover:bg-slate-800/60 ${
                    item.isBought ? "bg-gray-50/60 dark:bg-slate-800/40 opacity-85" : "bg-white dark:bg-slate-900"
                  }`}
                >
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleBought(item._id)}
                      className={`text-2xl transition p-1 rounded-full cursor-pointer shrink-0 active:scale-90 ${
                        item.isBought
                          ? "text-green-600 dark:text-emerald-400 hover:text-green-700"
                          : "text-gray-300 dark:text-slate-600 hover:text-green-500 dark:hover:text-emerald-400"
                      }`}
                      title={item.isBought ? "Mark as needed" : "Mark as bought"}
                    >
                      {item.isBought ? (
                        <FiCheckCircle className="fill-green-100 dark:fill-emerald-950/60 text-green-600 dark:text-emerald-400" />
                      ) : (
                        <FiCircle />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 pt-0.5 sm:pt-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-sm sm:text-base transition break-words ${
                            item.isBought
                              ? "line-through text-gray-400 dark:text-slate-500"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {item.name}
                        </span>

                        {item.isBought ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            <FiCheck className="text-xs" /> Purchased
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                            To Buy
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 sm:truncate">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions, Quantity, Timestamp & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 pl-10 sm:pl-0 shrink-0">
                    {/* Restock to Pantry Action (Available on purchased items) */}
                    {item.isBought && (
                      <button
                        type="button"
                        onClick={() => openRestockModal(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-95 border border-emerald-200/90 dark:border-emerald-800/60 px-2.5 sm:px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer hover-lift"
                        title="Add this purchased grocery into kitchen inventory"
                      >
                        <FiBox className="text-sm text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Restock</span>
                        <span className="hidden xl:inline">to Pantry</span>
                      </button>
                    )}

                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-300 whitespace-nowrap">
                      {item.neededQuantity} {item.unit}
                    </div>

                    <div className="hidden lg:flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                      <FiClock className="text-xs" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit action */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="text-gray-400 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 active:scale-90 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Edit shopping item"
                      >
                        <FiEdit3 className="text-base" />
                      </button>

                      {/* Delete action */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item._id, item.name)}
                        className="text-gray-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 active:scale-90 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-slate-800 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Delete item"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Restock to Pantry Modal */}
      {restockModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto my-auto overscroll-contain transition-colors">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-xl text-xl shadow-xs">
                  <FiBox />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-gray-900 dark:text-white tracking-tight">
                    Add Back to Pantry?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Stock <span className="font-semibold text-gray-800 dark:text-slate-200">"{restockModal.productName}"</span> into your kitchen inventory
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRestockModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-xl cursor-pointer p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                title="Close"
              >
                <FiX />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleRestockSubmit(true); }} className="space-y-4">
              {/* Product Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Product Name</label>
                  <input
                    type="text"
                    required
                    value={restockModal.productName}
                    onChange={(e) => setRestockModal((p) => ({ ...p, productName: e.target.value }))}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Category</label>
                  <select
                    value={restockModal.category}
                    onChange={(e) => setRestockModal((p) => ({ ...p, category: e.target.value }))}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition"
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

              {/* Quantity, Unit & Storage Location */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockModal.quantity}
                    onChange={(e) => setRestockModal((p) => ({ ...p, quantity: Number(e.target.value) || 1 }))}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Unit</label>
                  <select
                    value={restockModal.unit}
                    onChange={(e) => setRestockModal((p) => ({ ...p, unit: e.target.value }))}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition"
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

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Location</label>
                  <select
                    value={restockModal.storageLocation}
                    onChange={(e) => setRestockModal((p) => ({ ...p, storageLocation: e.target.value }))}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  >
                    <option value="Pantry">Pantry</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Freezer">Freezer</option>
                  </select>
                </div>
              </div>

              {/* Expiry Date Section with Presets */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FiCalendar className="text-emerald-600 dark:text-emerald-400" />
                    Expiry Date
                  </label>
                  <span className="text-[11px] text-gray-400 dark:text-slate-500">Quick presets:</span>
                </div>

                {/* Quick preset buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "+3 Days", days: 3 },
                    { label: "+7 Days", days: 7 },
                    { label: "+14 Days", days: 14 },
                    { label: "+1 Month", days: 30 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setRestockModal((p) => ({ ...p, expiryDate: getFutureDate(preset.days) }))}
                      className="py-1 px-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 hover:border-emerald-300 text-gray-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-400 transition shadow-2xs cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <input
                  type="date"
                  required
                  value={restockModal.expiryDate}
                  onChange={(e) => setRestockModal((p) => ({ ...p, expiryDate: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600 transition"
                />
              </div>

              {/* Notes (Optional) */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Notes (Optional)</label>
                <input
                  type="text"
                  value={restockModal.notes}
                  placeholder="e.g. Crisp and fresh, stored in veggie bin"
                  onChange={(e) => setRestockModal((p) => ({ ...p, notes: e.target.value }))}
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isRestocking}
                  onClick={() => handleRestockSubmit(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-sm transition hover-lift flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FiCheck className="text-base stroke-3" />
                  <span>{isRestocking ? "Restocking..." : "Add to Pantry & Clear from Shopping List"}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isRestocking}
                    onClick={() => handleRestockSubmit(false)}
                    className="py-2 px-3 rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-semibold text-xs border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer disabled:opacity-50"
                  >
                    Add to Pantry & Keep in List
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestockModal((prev) => ({ ...prev, isOpen: false }))}
                    className="py-2 px-3 rounded-xl text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 font-semibold text-xs transition cursor-pointer"
                  >
                    Skip (Just Mark as Bought)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Shopping Item Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-7 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto my-auto overscroll-contain transition-colors">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 p-2.5 rounded-xl text-xl shadow-xs">
                  <FiEdit3 />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-gray-900 dark:text-white tracking-tight">
                    Edit Market Item
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Update item details in your market list
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-xl cursor-pointer p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                title="Close"
              >
                <FiX />
              </button>
            </div>

            {editItemError && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs px-3.5 py-2.5 rounded-xl">
                {editItemError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveEditItem} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editModal.name}
                  onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))}
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  placeholder="e.g. Milk, Olive Oil"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Needed Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editModal.neededQuantity}
                    onChange={(e) => setEditModal((p) => ({ ...p, neededQuantity: Number(e.target.value) || 1 }))}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Unit</label>
                  <select
                    value={editModal.unit}
                    onChange={(e) => setEditModal((p) => ({ ...p, unit: e.target.value }))}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
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
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={editModal.notes}
                  onChange={(e) => setEditModal((p) => ({ ...p, notes: e.target.value }))}
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  placeholder="e.g. Brand, store, or special instructions"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModal((prev) => ({ ...prev, isOpen: false }))}
                  className="py-2.5 px-4 rounded-xl text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingItem}
                  className="py-2.5 px-5 rounded-xl text-white font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 shadow-sm transition hover-lift cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingItem ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItemsToShoppingCart;
