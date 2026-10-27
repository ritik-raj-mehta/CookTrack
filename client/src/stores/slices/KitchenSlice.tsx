import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type { RootState } from "../store";
import type { shoppingItemTypes } from "../../pages/AddItemsToShoppingCart";
import type { ItemsTypes, KitchenData, KitchenMember } from "../../types/KitchenTypes";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const KITCHEN_API = `${API_BASE}/api/kitchen`;

export type KitchenStateType = {
  loading: boolean;
  message: string | null;
  error: string | null;
  kitchenData: KitchenData | null;
  kitchenItems: ItemsTypes[];
  members: KitchenMember[];
};

const initialState: KitchenStateType = {
  loading: false,
  message: null,
  error: null,
  kitchenData: null,
  kitchenItems: [],
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
  async (data: shoppingItemTypes, { rejectWithValue, getState }) => {
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

export const kitchenSlice = createSlice({
  name: "kitchen",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch kitchen
      .addCase(fetchKitchenData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchKitchenData.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || null;
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
        state.message = null;
      })
      .addCase(fetchAllKitchenItemsByKitchenId.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || null;
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
        state.message = action.payload?.message || "Items added successfully";
      })
      .addCase(addItemsToShoppingCart.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
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
      });
  },
});

export default kitchenSlice.reducer;
