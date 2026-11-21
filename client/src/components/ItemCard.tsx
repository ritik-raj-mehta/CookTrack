import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaCartPlus, FaRegCalendarCheck } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { FiAlertCircle, FiCheck, FiCheckCircle, FiEdit3 } from "react-icons/fi";
import type { RootState } from "../stores/store";
import type { ItemsTypes } from "../types/KitchenTypes";

type ProductPropTypes = {
  productData: ItemsTypes[];
  onDelete?: (item: ItemsTypes) => void;
  onEdit?: (item: ItemsTypes) => void;
  onAddToShoppingList?: (item: ItemsTypes) => Promise<void> | void;
};

const ItemCard = ({
  productData,
  onDelete,
  onEdit,
  onAddToShoppingList,
}: ProductPropTypes) => {
  const { shoppingItems } = useSelector((state: RootState) => state.kitchen);
  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAddToList = async (k: ItemsTypes, itemId: string) => {
    if (!onAddToShoppingList) return;
    setAddingIds((prev) => ({ ...prev, [itemId]: true }));
    try {
      await onAddToShoppingList(k);
      setAddedIds((prev) => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [itemId]: false }));
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingIds((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Helper to check if item is expiring soon (within 3 days)
  const isExpiringSoon = (dateStr?: string) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-8 place-content-center gap-6">
      {productData.map((k, idx) => {
        const itemId = k._id || (k as { productId?: string }).productId || String(idx);
        const isLowStock = Number(k.quantity) <= 2;
        const isOutOfStock = Number(k.quantity) === 0;
        const expiringSoon = isExpiringSoon(k.expiryDate);

        // Check if item is already in shopping list (pending purchase)
        const targetCartItem = (shoppingItems || []).find(
          (s) =>
            !s.isBought &&
            s.name.trim().toLowerCase() === (k.productName || "").trim().toLowerCase()
        );
        const isInShoppingList = Boolean(targetCartItem);

        let stockBadge = (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight">
            In Stock
          </span>
        );

        if (isOutOfStock) {
          stockBadge = (
            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight animate-pulse">
              Out of Stock
            </span>
          );
        } else if (isLowStock) {
          stockBadge = (
            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight">
              Low Stock ({k.quantity})
            </span>
          );
        }

        return (
          <div
            key={itemId}
            className={`bg-white rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between border ${
              isOutOfStock
                ? "border-rose-200/90 bg-gradient-to-b from-rose-50/20 to-white"
                : isLowStock
                ? "border-amber-200/90 bg-gradient-to-b from-amber-50/20 to-white"
                : "border-gray-100 hover:border-emerald-200"
            }`}
          >
            <div>
              {/* Header: Title & Stock Status */}
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-slate-800 break-words leading-snug">
                    {k.productName}
                  </h3>
                  <span className="inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                    {k.category || "Pantry"}
                  </span>
                </div>
                {stockBadge}
              </div>

              {/* Specs: Quantity & Storage Location */}
              <div className="grid grid-cols-2 gap-3 py-3 mt-1 text-sm bg-slate-50/60 p-3 rounded-xl border border-slate-100/80">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quantity
                  </p>
                  <p
                    className={`font-bold mt-0.5 ${
                      isLowStock ? "text-amber-700" : "text-slate-800"
                    }`}
                  >
                    <span>{k.quantity} </span>
                    <span className="text-xs font-medium text-slate-500">{k.unit}</span>
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Location
                  </p>
                  <p className="flex items-center gap-1 font-semibold text-slate-700 mt-0.5 truncate">
                    <IoLocationOutline className="text-emerald-600 text-sm shrink-0" />
                    <span className="truncate">{k.storageLocation || "Pantry"}</span>
                  </p>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="pt-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Expiry:</span>
                <span
                  className={`flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-md ${
                    expiringSoon
                      ? "text-rose-700 bg-rose-50 border border-rose-200 animate-pulse"
                      : "text-slate-700"
                  }`}
                >
                  <FaRegCalendarCheck
                    className={expiringSoon ? "text-rose-600" : "text-amber-600"}
                  />
                  {k.expiryDate || "No date set"}
                </span>
              </div>

              {/* Notes */}
              {k.notes && (
                <p className="text-xs text-slate-500 mt-2.5 bg-slate-50 p-2.5 rounded-xl italic border border-slate-100 line-clamp-2">
                  "{k.notes}"
                </p>
              )}

              {/* Low Stock / Out of Stock Refill Callout */}
              {isLowStock && onAddToShoppingList && (
                <div className="mt-4 pt-3 border-t border-dashed border-amber-200/80 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-amber-800 flex items-center gap-1">
                      <FiAlertCircle className="text-amber-600 text-xs" />
                      {isOutOfStock ? "Out of stock!" : "Refill needed"}
                    </span>
                    {isInShoppingList ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <FiCheck className="text-xs stroke-3" /> In Market List
                      </span>
                    ) : (
                      <span className="text-amber-600/90 font-medium">Auto-add to cart</span>
                    )}
                  </div>

                  {isInShoppingList ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 flex items-center justify-center gap-1.5 text-xs font-bold shadow-2xs">
                        <FiCheckCircle className="text-emerald-600 text-sm shrink-0" />
                        <span className="truncate">
                          In Market List ({targetCartItem?.neededQuantity} {targetCartItem?.unit})
                        </span>
                      </div>
                      <NavLink
                        to="/additemstoshoppingcart"
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition hover-lift whitespace-nowrap"
                        title="View and manage in market list"
                      >
                        View Cart →
                      </NavLink>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={addingIds[itemId]}
                      onClick={() => handleAddToList(k, itemId)}
                      className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                        addedIds[itemId]
                          ? "bg-emerald-600 text-white shadow-emerald-200"
                          : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-200/50 hover-lift"
                      }`}
                    >
                      {addedIds[itemId] ? (
                        <>
                          <FiCheck className="text-sm stroke-3" />
                          <span>Added to Market List!</span>
                        </>
                      ) : (
                        <>
                          <FaCartPlus className="text-sm" />
                          <span>{addingIds[itemId] ? "Adding..." : "Add to Market List"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Edit & Delete Actions */}
            <div className="pt-4 mt-3 border-t border-gray-100 flex items-center gap-2.5">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(k)}
                  className="flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-x-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold border border-blue-200/80 text-xs sm:text-sm cursor-pointer transition shadow-2xs hover-lift"
                >
                  <FiEdit3 className="text-sm" />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(k)}
                  className="flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-x-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 font-semibold border border-rose-200/80 text-xs sm:text-sm cursor-pointer transition shadow-2xs hover-lift"
                >
                  <MdDeleteOutline className="text-base" />
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ItemCard;
