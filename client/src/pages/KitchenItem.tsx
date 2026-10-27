import { NavLink } from "react-router-dom";
import { CiFilter, CiSearch } from "react-icons/ci";
import { FiCodesandbox } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../stores/store";
import { useEffect, useState } from "react";
import { fetchAllKitchenItemsByKitchenId, deleteKitchenItem } from "../stores/slices/KitchenSlice";
import ItemCard from "../components/ItemCard";
import type { ItemsTypes } from "../types/KitchenTypes";

const KitchenItem = () => {
  const { kitchenItems } = useSelector((state: RootState) => state.kitchen);
  const { kitchenId } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");

  useEffect(() => {
    if (kitchenId) {
      dispatch(fetchAllKitchenItemsByKitchenId());
    }
  }, [dispatch, kitchenId]);

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm("Are you sure you want to remove this item from your kitchen?")) {
      await dispatch(deleteKitchenItem(itemId));
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
    <div className="w-full bg-gray-100 min-h-screen">
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
              <p className="text-sm mt-1">Try adjusting your filters or search term, or add new items to your kitchen.</p>
              <NavLink to="/additemstokitchen" className="inline-block mt-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-600">
                Add Your First Item
              </NavLink>
            </div>
          ) : (
            <ItemCard productData={filteredItems} onDelete={handleDeleteItem} />
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenItem;
