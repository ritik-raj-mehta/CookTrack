import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type { RootState } from "../store";
import type { ItemsTypes, KitchenData, KitchenMember, ShoppingItem, ShoppingItemInput } from "../../types/KitchenTypes";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const KITCHEN_API = `${API_BASE}/api/kitchen`;

export type KitchenStateType = {
  loading: boolean;
  message: string | null;
  error: string | null;
  kitchenData: KitchenData | null;
  kitchenItems: ItemsTypes[];
  shoppingItems: ShoppingItem[];
  members: KitchenMember[];
};

const initialState: KitchenStateType = {
  loading: false,
  message: null,
  error: null,
  kitchenData: null,
  kitchenItems: [],
  shoppingItems: [],
  members: [],
};

export const fetchKitchenData = createAsyncThunk(
  "kitchen/fetchKitchenData",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId, userId } = state.auth;
      if (!kitchenId || !userId) {
        return rejectWithValue("Kitchen or User ID missing");
      }
      const res = await axios.get(
        `${KITCHEN_API}/kitchen/${kitchenId}/${userId}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Fetching kitchen failed");
    }
  }
);

export const fetchAllKitchenItemsByKitchenId = createAsyncThunk(
  "kitchen/kitchenItems",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) {
        return rejectWithValue("Kitchen ID missing");
      }
      const res = await axios.get(
        `${KITCHEN_API}/kitchenItems/${kitchenId}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Fetching kitchen items failed");
    }
  }
);

export const addKitchenItems = createAsyncThunk(
  "kitchen/addKitchenItems",
  async (data: ItemsTypes, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) {
        return rejectWithValue("Kitchen ID missing");
      }

      const res = await axios.post(
        `${KITCHEN_API}/addItems/${kitchenId}`,
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Items not added successfully");
    }
  }
);

export const addItemsToShoppingCart = createAsyncThunk(
  "kitchen/addItemsToShoppingCart",
  async (data: ShoppingItemInput, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) {
        return rejectWithValue("Kitchen ID missing");
      }

      const res = await axios.post(
        `${KITCHEN_API}/addShoppingItems/${kitchenId}`,
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Items not added successfully");
    }
  }
);

export const fetchShoppingItems = createAsyncThunk(
  "kitchen/fetchShoppingItems",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) {
        return rejectWithValue("Kitchen ID missing");
      }
      const res = await axios.get(
        `${KITCHEN_API}/shoppingItems/${kitchenId}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Fetching shopping items failed");
    }
  }
);

export const toggleShoppingItemBought = createAsyncThunk(
  "kitchen/toggleShoppingItemBought",
  async (itemId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) {
        return rejectWithValue("Kitchen ID missing");
      }
      const res = await axios.patch(
        `${KITCHEN_API}/shoppingItem/${kitchenId}/${itemId}/toggle`,
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Updating item status failed");
    }
  }
);

export const deleteShoppingItem = createAsyncThunk(
  "kitchen/deleteShoppingItem",
  async (itemId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) {
        return rejectWithValue("Kitchen ID missing");
      }
      const res = await axios.delete(
        `${KITCHEN_API}/shoppingItem/${kitchenId}/${itemId}`,
        { withCredentials: true }
      );
      return { ...res.data, itemId };
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to delete item");
    }
  }
);

export const deleteKitchenItem = createAsyncThunk(
  "kitchen/deleteKitchenItem",
  async (itemId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      const res = await axios.delete(
        `${KITCHEN_API}/kitchen/${kitchenId}/item/${itemId}`,
        { withCredentials: true }
      );
      return { ...res.data, itemId };
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to delete item");
    }
  }
);

export const updateKitchenItem = createAsyncThunk(
  "kitchen/updateKitchenItem",
  async (
    { itemId, data }: { itemId: string; data: Partial<ItemsTypes> },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) {
        return rejectWithValue("Kitchen ID missing");
      }
      const res = await axios.put(
        `${KITCHEN_API}/kitchen/${kitchenId}/item/${itemId}`,
        data,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to update item");
    }
  }
);

export const fetchKitchenMembers = createAsyncThunk(
  "kitchen/fetchKitchenMembers",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) {
        return rejectWithValue("Kitchen ID missing");
      }
      const res = await axios.get(
        `${KITCHEN_API}/members/${kitchenId}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to fetch members");
    }
  }
);

export const leaveKitchen = createAsyncThunk(
  "kitchen/leaveKitchen",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) return rejectWithValue("Kitchen ID missing");
      const res = await axios.post(
        `${KITCHEN_API}/leave/${kitchenId}`,
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to leave kitchen");
    }
  }
);

export const deleteWholeKitchen = createAsyncThunk(
  "kitchen/deleteWholeKitchen",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) return rejectWithValue("Kitchen ID missing");
      const res = await axios.delete(
        `${KITCHEN_API}/deleteKitchen/${kitchenId}`,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to delete kitchen");
    }
  }
);

export const makeMemberAdmin = createAsyncThunk(
  "kitchen/makeMemberAdmin",
  async (targetUserId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;
      if (!kitchenId) return rejectWithValue("Kitchen ID missing");
      const res = await axios.patch(
        `${KITCHEN_API}/makeAdmin/${kitchenId}/${targetUserId}`,
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      return rejectWithValue(err.response?.data?.message || "Failed to promote member");
    }
  }
);

export const kitchenSlice = createSlice({
  name: "kitchen",
  initialState,
  reducers: {
    clearKitchenMessage: (state) => {
      state.message = null;
    },
    clearKitchenError: (state) => {
      state.error = null;
    },
    resetKitchenState: (state) => {
      state.kitchenData = null;
      state.kitchenItems = [];
      state.shoppingItems = [];
      state.members = [];
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch kitchen
      .addCase(fetchKitchenData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKitchenData.fulfilled, (state, action) => {
        state.loading = false;
        state.kitchenData = action.payload?.data || null;
      })
      .addCase(fetchKitchenData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
      })

      // fetchallkitchenitems
      .addCase(fetchAllKitchenItemsByKitchenId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllKitchenItemsByKitchenId.fulfilled, (state, action) => {
        state.loading = false;
        state.kitchenItems = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(fetchAllKitchenItemsByKitchenId.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
        state.kitchenItems = [];
      })

      // add items
      .addCase(addKitchenItems.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(addKitchenItems.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Items added successfully";
      })
      .addCase(addKitchenItems.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
      })

      // add shopping item
      .addCase(addItemsToShoppingCart.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(addItemsToShoppingCart.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Shopping item added successfully";
        if (action.payload?.data) {
          state.shoppingItems = [action.payload.data, ...state.shoppingItems];
        }
      })
      .addCase(addItemsToShoppingCart.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
      })

      // fetch shopping items
      .addCase(fetchShoppingItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShoppingItems.fulfilled, (state, action) => {
        state.loading = false;
        state.shoppingItems = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(fetchShoppingItems.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
        state.shoppingItems = [];
      })

      // toggle shopping item bought
      .addCase(toggleShoppingItemBought.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          state.shoppingItems = state.shoppingItems.map((item) =>
            item._id === updated._id ? updated : item
          );
        }
      })

      // delete shopping item
      .addCase(deleteShoppingItem.fulfilled, (state, action) => {
        state.shoppingItems = state.shoppingItems.filter(
          (item) => item._id !== action.payload.itemId
        );
      })

      // delete item
      .addCase(deleteKitchenItem.fulfilled, (state, action) => {
        state.kitchenItems = state.kitchenItems.filter(
          (item) => item._id !== action.payload.itemId
        );
        if (state.kitchenData?.kitchenItemIds) {
          state.kitchenData.kitchenItemIds = state.kitchenData.kitchenItemIds.filter(
            (item) => item._id !== action.payload.itemId
          );
        }
      })

      // update item
      .addCase(updateKitchenItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateKitchenItem.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data;
        if (updated) {
          state.kitchenItems = state.kitchenItems.map((item) =>
            item._id === updated._id ? { ...item, ...updated } : item
          );
          if (state.kitchenData?.kitchenItemIds) {
            state.kitchenData.kitchenItemIds = state.kitchenData.kitchenItemIds.map((item) =>
              item._id === updated._id ? { ...item, ...updated } : item
            );
          }
        }
      })
      .addCase(updateKitchenItem.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
      })

      // fetch members
      .addCase(fetchKitchenMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKitchenMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload?.data?.members || [];
      })
      .addCase(fetchKitchenMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
      })

      // leave kitchen
      .addCase(leaveKitchen.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveKitchen.fulfilled, (state, action) => {
        state.loading = false;
        state.kitchenData = null;
        state.kitchenItems = [];
        state.shoppingItems = [];
        state.members = [];
        state.message = action.payload?.message || "Left kitchen successfully";
      })
      .addCase(leaveKitchen.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
      })

      // delete whole kitchen
      .addCase(deleteWholeKitchen.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWholeKitchen.fulfilled, (state, action) => {
        state.loading = false;
        state.kitchenData = null;
        state.kitchenItems = [];
        state.shoppingItems = [];
        state.members = [];
        state.message = action.payload?.message || "Kitchen permanently deleted";
      })
      .addCase(deleteWholeKitchen.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
      })

      // make member admin
      .addCase(makeMemberAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(makeMemberAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data;
        if (updated) {
          state.members = state.members.map((m) =>
            m._id === updated._id ? { ...m, role: "KitchenAdmin" } : m
          );
        }
      })
      .addCase(makeMemberAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
      });
  },
});

export const { clearKitchenMessage, clearKitchenError, resetKitchenState } = kitchenSlice.actions;

export default kitchenSlice.reducer;
