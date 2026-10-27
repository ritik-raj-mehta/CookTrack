import { FaRegCalendarCheck } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import type { ItemsTypes } from "../types/KitchenTypes";

type ProductPropTypes = {
  productData: ItemsTypes[];
  onDelete?: (id: string) => void;
};

const ItemCard = ({ productData, onDelete }: ProductPropTypes) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-8 place-content-center gap-[30px]">
      {productData.map((k, idx) => {
        const itemId = k._id || (k as { productId?: string }).productId || String(idx);

        let stockBadge = (
          <p className="bg-green-500 px-3 py-0.5 rounded-2xl text-xs font-semibold my-auto text-white">
            In Stock
          </p>
        );
        if (k.quantity === 0) {
          stockBadge = (
            <p className="bg-gray-500 px-3 py-0.5 rounded-2xl text-xs font-semibold my-auto text-white">
              Out of Stock
            </p>
          );
        } else if (k.quantity <= 2) {
          stockBadge = (
            <p className="bg-red-500 px-3 py-0.5 rounded-2xl text-xs font-semibold my-auto text-white">
              Low Stock
            </p>
          );
        }

        return (
          <div key={itemId} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-lg text-slate-800 break-words">{k.productName}</h3>
                {stockBadge}
              </div>
              <p className="opacity-70 text-sm mt-0.5">{k.category || "General"}</p>

              <div className="flex justify-between py-3 pe-4 text-sm">
                <div className="space-y-[-2px]">
                  <p className="opacity-70 text-xs">Quantity</p>
                  <p className="font-semibold text-slate-700">
                    <span>{k.quantity} </span>{k.unit}
                  </p>
                </div>

                <div className="space-y-[-2px]">
                  <p className="opacity-70 text-xs">Location</p>
                  <p className="flex items-center gap-1 font-semibold text-slate-700">
                    <IoLocationOutline />
                    {k.storageLocation || "Kitchen"}
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <p className="opacity-70 text-xs">Expiry Date</p>
                <p className="flex items-center font-medium text-sm gap-2 text-slate-700 mt-0.5">
                  <FaRegCalendarCheck className="text-amber-700" />
                  {k.expiryDate || "No date set"}
                </p>
              </div>

              {k.notes && (
                <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded italic">
                  "{k.notes}"
                </p>
              )}
            </div>

            <div className="pt-5 flex justify-end">
              {onDelete && k._id && (
                <button
                  type="button"
                  onClick={() => onDelete(k._id!)}
                  className="w-full py-1.5 rounded-lg flex items-center justify-center gap-x-2 text-red-600 bg-red-50 hover:bg-red-100 font-semibold border border-red-200 text-sm cursor-pointer transition"
                >
                  <MdDeleteOutline className="text-lg" />
                  Delete Item
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