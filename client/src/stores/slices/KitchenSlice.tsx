import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import type { RootState } from "../store"  
import type { shoppingItemTypes } from "../../pages/AddItemsToShoppingCart"
import type { ItemsTypes } from "../../types/KitchenTypes"

export type KitchenStateType = {
  loading: boolean
  message: string | null
  error: string | null
  kitchenData: any
  kitchenItems : ItemsTypes[]
}

const initialState: KitchenStateType = {
  loading: false,
  message: null,
  error: null,
  kitchenData: null,
  kitchenItems : []
}


export const fetchKitchenData = createAsyncThunk(
  "kitchen/fetchKitchenData", 
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId, userId } = state.auth;
      console.log(userId,kitchenId)
      const res = await axios.get(
        `http://localhost:5000/api/kitchen/kitchen/${kitchenId}/${userId}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Fetching kitchen failed");
    }
  }
);

export const fetchAllKitchenItemsByKitchenId = createAsyncThunk(
  "kitchen/kitchenItems",
  async (_, {rejectWithValue,getState}) => {
      try {
        const state = getState() as RootState;
        const {kitchenId} = state.auth;
        const res = await axios.get(
        `http://localhost:5000/api/kitchen/kitchenItems/${kitchenId}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      return res.data;
      } catch (error:any) {
        return rejectWithValue(error.response?.data?.message || "Fetching kitchen items failed");
      }
    }
)


export const addKitchenItems = createAsyncThunk(
  "kitchen/addKitchenItems",
  async (data: ItemsTypes, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { kitchenId } = state.auth;

      const res = await axios.post(
        `http://localhost:5000/api/kitchen/addItems/${kitchenId}`,
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Items not added successfully");
    }
  }
);

export const addItemsToShoppingCart = createAsyncThunk(
  "kitchen/addItemsToShoppingCart",
  async (data: shoppingItemTypes, {rejectWithValue , getState}) => {
try {
  const state = getState() as RootState;
   const { kitchenId } = state.auth;
   const res = await axios.post(`http://localhost:5000/api/kitchen/addShoppingItems/${kitchenId}`,data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Items not added successfully");
    }
  }
)



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

      //fetchallkitchenitems
      .addCase(fetchAllKitchenItemsByKitchenId.pending,(state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchAllKitchenItemsByKitchenId.fulfilled,(state,action) => {
        state.loading = false;
        state.message = action.payload?.message || null;
        state.kitchenItems = action.payload?.data || null;
      })
      .addCase(fetchAllKitchenItemsByKitchenId.rejected,(state,action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || null;
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
  }
});

export default kitchenSlice.reducer;

