import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/api";
import { AxiosError } from "axios";

export interface PlatformStats {
  totalUsers: number;
  totalKitchens: number;
  totalItems: number;
  totalShoppingItems: number;
  totalLogs: number;
  activeUsers24h: number;
  moneySaved: number;
  moneyWasted: number;
  itemsConsumed: number;
  itemsWasted: number;
  platformEcoScore: number;
  storageDistribution: {
    fridge: number;
    freezer: number;
    pantry: number;
  };
  serverUptime: number;
  nodeVersion: string;
}

export interface KitchenSummary {
  _id: string;
  kitchenId: string;
  kitchenName: string;
  admin: {
    name: string;
    email: string;
    phone: string;
  } | null;
  membersCount: number;
  itemsCount: number;
  shoppingItemsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  _id: string;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  role: string;
  kitchenId: string;
  kitchenName?: string;
  isSuspended: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  _id: string;
  kitchenId: string;
  userName: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  action: "restocked" | "consumed" | "wasted";
  estimatedCost: number;
  notes: string;
  createdAt: string;
}

export interface PlatformSettings {
  announcementText: string;
  announcementActive: boolean;
  announcementLevel: "info" | "warning" | "critical";
  maintenanceMode: boolean;
  updatedBy?: string;
}

interface SuperAdminState {
  stats: PlatformStats | null;
  settings: PlatformSettings | null;
  kitchens: KitchenSummary[];
  kitchensTotal: number;
  users: UserSummary[];
  usersTotal: number;
  logs: AuditLog[];
  logsTotal: number;
  inspectedKitchen: {
    kitchen: any;
    items: any[];
    shoppingItems: any[];
    logs: any[];
  } | null;
  loading: boolean;
  inspectLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: SuperAdminState = {
  stats: null,
  settings: null,
  kitchens: [],
  kitchensTotal: 0,
  users: [],
  usersTotal: 0,
  logs: [],
  logsTotal: 0,
  inspectedKitchen: null,
  loading: false,
  inspectLoading: false,
  actionLoading: false,
  error: null,
  message: null,
};

/* ---------------- ASYNC THUNKS ---------------- */

// 1. Fetch Global Platform Stats
export const fetchPlatformStats = createAsyncThunk(
  "superAdmin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/superadmin/stats");
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to fetch platform stats");
    }
  }
);

// 2. Fetch Kitchens List
export const fetchAllKitchens = createAsyncThunk(
  "superAdmin/fetchKitchens",
  async (
    params: { search?: string; page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.get("/api/superadmin/kitchens", { params });
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to fetch kitchens list");
    }
  }
);

// 3. Deep Inspect Kitchen
export const inspectKitchen = createAsyncThunk(
  "superAdmin/inspectKitchen",
  async (kitchenId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/api/superadmin/kitchens/${kitchenId}`);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to inspect kitchen");
    }
  }
);

// 4. Delete Kitchen As Super Admin
export const deleteKitchenSuperAdmin = createAsyncThunk(
  "superAdmin/deleteKitchen",
  async (kitchenId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.delete(`/api/superadmin/kitchens/${kitchenId}`);
      return { kitchenId, message: res.data.message };
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to delete kitchen");
    }
  }
);

// 5. Fetch Users List
export const fetchAllUsers = createAsyncThunk(
  "superAdmin/fetchUsers",
  async (
    params: { search?: string; role?: string; page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.get("/api/superadmin/users", { params });
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users list");
    }
  }
);

// 6. Toggle User Suspension
export const toggleUserSuspension = createAsyncThunk(
  "superAdmin/toggleSuspension",
  async (userId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/api/superadmin/users/${userId}/suspend`);
      return { userId, isSuspended: res.data.isSuspended, message: res.data.message };
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to toggle suspension");
    }
  }
);

// 7. Update User Role
export const updateUserRole = createAsyncThunk(
  "superAdmin/updateRole",
  async ({ userId, role }: { userId: string; role: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/api/superadmin/users/${userId}/role`, { role });
      return { userId, role: res.data.user.role, message: res.data.message };
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to update role");
    }
  }
);

// 8. Fetch Platform Audit Logs
export const fetchAuditLogs = createAsyncThunk(
  "superAdmin/fetchLogs",
  async (
    params: { action?: string; page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.get("/api/superadmin/logs", { params });
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to fetch audit logs");
    }
  }
);

// 9. Update Platform Settings
export const updatePlatformSettings = createAsyncThunk(
  "superAdmin/updateSettings",
  async (settings: Partial<PlatformSettings>, { rejectWithValue }) => {
    try {
      const res = await apiClient.put("/api/superadmin/settings", settings);
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "Failed to update platform settings");
    }
  }
);

// 10. Run System Cleanup
export const runSystemCleanup = createAsyncThunk(
  "superAdmin/cleanup",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/superadmin/cleanup");
      return res.data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return rejectWithValue(error.response?.data?.message || "System cleanup failed");
    }
  }
);

/* ---------------- SLICE ---------------- */

export const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState,
  reducers: {
    clearSuperAdminError: (state) => {
      state.error = null;
    },
    clearSuperAdminMessage: (state) => {
      state.message = null;
    },
    clearInspectedKitchen: (state) => {
      state.inspectedKitchen = null;
    },
  },
  extraReducers: (builder) => {
    // Stats
    builder
      .addCase(fetchPlatformStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.settings = action.payload.settings;
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Kitchens
    builder
      .addCase(fetchAllKitchens.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllKitchens.fulfilled, (state, action) => {
        state.loading = false;
        state.kitchens = action.payload.kitchens;
        state.kitchensTotal = action.payload.pagination.total;
      })
      .addCase(fetchAllKitchens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Inspect Kitchen
    builder
      .addCase(inspectKitchen.pending, (state) => {
        state.inspectLoading = true;
        state.inspectedKitchen = null;
      })
      .addCase(inspectKitchen.fulfilled, (state, action) => {
        state.inspectLoading = false;
        state.inspectedKitchen = {
          kitchen: action.payload.kitchen,
          items: action.payload.items,
          shoppingItems: action.payload.shoppingItems,
          logs: action.payload.logs,
        };
      })
      .addCase(inspectKitchen.rejected, (state, action) => {
        state.inspectLoading = false;
        state.error = action.payload as string;
      });

    // Delete Kitchen
    builder
      .addCase(deleteKitchenSuperAdmin.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteKitchenSuperAdmin.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.kitchens = state.kitchens.filter((k) => k.kitchenId !== action.payload.kitchenId);
        state.kitchensTotal = Math.max(0, state.kitchensTotal - 1);
        state.message = action.payload.message;
        if (state.inspectedKitchen?.kitchen?.kitchenId === action.payload.kitchenId) {
          state.inspectedKitchen = null;
        }
      })
      .addCase(deleteKitchenSuperAdmin.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.usersTotal = action.payload.pagination.total;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle Suspension
    builder
      .addCase(toggleUserSuspension.fulfilled, (state, action) => {
        const u = state.users.find((user) => user._id === action.payload.userId);
        if (u) {
          u.isSuspended = action.payload.isSuspended;
        }
        state.message = action.payload.message;
      })
      .addCase(toggleUserSuspension.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update Role
    builder
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const u = state.users.find((user) => user._id === action.payload.userId);
        if (u) {
          u.role = action.payload.role;
        }
        state.message = action.payload.message;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Logs
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.logs;
        state.logsTotal = action.payload.pagination.total;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Settings
    builder
      .addCase(updatePlatformSettings.fulfilled, (state, action) => {
        state.settings = action.payload.settings;
        state.message = action.payload.message;
      })
      .addCase(updatePlatformSettings.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Cleanup
    builder
      .addCase(runSystemCleanup.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(runSystemCleanup.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.message = `${action.payload.message} (${action.payload.summary.expiredOtpsPruned} OTPs purged, ${action.payload.summary.orphanedItemsPruned} orphaned items cleaned)`;
      })
      .addCase(runSystemCleanup.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSuperAdminError,
  clearSuperAdminMessage,
  clearInspectedKitchen,
} = superAdminSlice.actions;

export default superAdminSlice.reducer;
