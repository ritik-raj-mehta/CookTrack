
// import { API_BASE_URL } from '@/services';
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { QueryClient } from '@tanstack/react-query';
// import axios from 'axios';
// import { REHYDRATE } from 'redux-persist';

// interface AuthState {
//     isAuthenticated: boolean;
//     accessToken: string;
//     refreshToken: string;
//     authLoading: boolean;
//     initialAuthLoading: boolean;
//     user: any;
//     error: string | null;
//     isUserRegistered: boolean | null;
// }

// const initialState: AuthState = {
//     isAuthenticated: false,
//     accessToken: '',
//     refreshToken: '',
//     authLoading: false,
//     isUserRegistered: false,
//     initialAuthLoading: true,
//     user: null,
//     error: null,
// };

// const AUTH_API_BASE_URL = `${API_BASE_URL}/auth`;

// export const sendOtp = createAsyncThunk('auth/sendOtp', async (payload: { phone?: string; medium?: string }) => {
//     const response = await axios.post(`${AUTH_API_BASE_URL}/send-otp`, payload);
//     return response?.data;
// });
// export const CheckPhoneRegisteredUser = createAsyncThunk('auth/checkPhone', async (payload: { phone?: string }) => {
//     const response = await axios.post(`${AUTH_API_BASE_URL}/check-phone`, payload);
//     return response?.data;
// });

// export const checkOtp = createAsyncThunk('auth/checkOtp', async (payload: { phone?: string; otp: string }) => {
//     const response = await axios.post(`${AUTH_API_BASE_URL}/check-otp`, payload);
//     return response?.data;
// });

// export const logout = createAsyncThunk('auth/logout', async (_, thunkApi) => {
//     // @ts-ignore
//     const { accessToken, refreshToken } = thunkApi.getState().auth as AuthState;
//     try {
//         const response = await axios.post(
//             `${AUTH_API_BASE_URL}/logout`,
//             { refreshToken },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//             }
//         );
//         thunkApi.dispatch(setTokens({ accessToken: '', refreshToken: '' }));
//         return;
//     } catch (error: any) {
//         thunkApi.dispatch(setTokens({ accessToken: '', refreshToken: '' }));
//         return thunkApi.rejectWithValue(error.message);
//     }
// });

// export const registerUser = createAsyncThunk('auth/registerCustomerUser', async (payload: { name: { first: string; last: string }; phone: string; email: string }) => {
//     const response = await axios.post(`${AUTH_API_BASE_URL}/register-customer`, payload);
//     return response?.data;
// });

// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         setTokens: (state, action) => {
//             const { accessToken, refreshToken } = action.payload;
//             // console.log("action.payload", action.payload)
//             state.accessToken = accessToken;
//             state.refreshToken = refreshToken;
//         },
//         setAuthData: (state, action) => {
//             const { user, tokens } = action.payload;
//             state.accessToken = tokens?.access?.token || '';
//             state.refreshToken = tokens?.refresh?.token || '';
//             state.authLoading = false;
//             state.isAuthenticated = true;
//             state.user = user;
//         },
//         setUserRegistrationStatus: (state, action) => {
//             state.isUserRegistered = action.payload;
//         },
//     },
//     extraReducers: (builder) => {
//         builder.addCase(REHYDRATE, (state, action) => {
//             // @ts-ignore
//             const { payload } = action;
//             if (payload) {
//                 state.initialAuthLoading = !!payload.isAuthenticated;
//                 state.isAuthenticated = !!payload.isAuthenticated;
//                 state.accessToken = payload.accessToken || '';
//                 state.refreshToken = payload.refreshToken || '';
//                 state.user = payload.user || null;
//             }
//         });
//         builder
//             .addCase(registerUser.pending, (state) => {
//                 state.authLoading = true;
//                 state.error = null;
//             })
//             .addCase(registerUser.fulfilled, (state, action) => {
//                 const { data, user } = action.payload;
//                 state.authLoading = false;
//                 state.isAuthenticated = true;
//                 state.accessToken = data?.tokens?.access?.token || '';
//                 state.refreshToken = data?.tokens?.refresh?.token || '';
//                 state.user = user || {};
//                 state.isUserRegistered = true;
//             })
//             .addCase(registerUser.rejected, (state, action) => {
//                 state.authLoading = false;
//                 state.error = action.error.message || 'Failed to register';
//                 state.isUserRegistered = false;
//             })
//             .addCase(CheckPhoneRegisteredUser.pending, (state) => {
//                 state.authLoading = true;
//                 state.error = null;
//             })
//             .addCase(CheckPhoneRegisteredUser.fulfilled, (state, action) => {
//                 state.authLoading = false;
//                 // state.accessToken = action.payload.tokens?.access?.token || '';
//                 state.refreshToken = action.payload.tokens?.refresh?.token || '';
//                 // state.user = action.payload.user || {};
//                 // state.isAuthenticated = true;
//                 // state.authLoading = false;
//                 state.isUserRegistered = action.payload.isUserRegistered;
//             })
//             .addCase(CheckPhoneRegisteredUser.rejected, (state, action) => {
//                 state.authLoading = false;
//                 state.isUserRegistered = false;
//                 state.error = action.error.message || 'User not registered';
//             })
//             .addCase(sendOtp.pending, (state) => {
//                 state.authLoading = true;
//                 state.error = null;
//             })
//             .addCase(sendOtp.fulfilled, (state, action) => {
//                 const { tokens, user } = action.payload;
//                 state.authLoading = false;
//                 state.accessToken = tokens?.access?.token || '';
//                 state.refreshToken = tokens?.refresh?.token || '';
//                 state.user = user || {};
//                 state.isUserRegistered = action.payload.isUserRegistered;
//             })
//             .addCase(sendOtp.rejected, (state, action) => {
//                 state.authLoading = false;
//                 state.error = action.error.message || 'Failed to send OTP';
//             })
//             .addCase(checkOtp.pending, (state) => {
//                 state.authLoading = true;
//                 state.error = null;
//             })
//             .addCase(checkOtp.fulfilled, (state, action) => {
//                 const { success, data } = action.payload;
//                 state.authLoading = false;
//                 if (success && data.isOtpValid && data?.tokens) {
//                     state.isAuthenticated = true;
//                     state.accessToken = data.tokens?.access?.token || '';
//                     state.refreshToken = data.tokens?.refresh?.token || '';
//                     state.user = data.user || {};
//                 } else {
//                     state.isAuthenticated = false;
//                 }
//             })
//             .addCase(checkOtp.rejected, (state, action) => {
//                 state.authLoading = false;
//                 state.error = action.error.message || 'Failed to verify OTP';
//             })

//             .addCase(logout.pending, (state) => {
//                 state.authLoading = true;
//             })
//             .addCase(logout.fulfilled, (state) => {
//                 state.authLoading = false;
//                 state.isAuthenticated = false;
//                 state.accessToken = '';
//                 state.refreshToken = '';
//                 state.user = null;
//                 state.error = null;
//             })
//             .addCase(logout.rejected, (state, action) => {
//                 state.authLoading = false;
//                 state.isAuthenticated = false;
//                 state.error = (action.payload as string) || 'Failed to logout';
//                 state.accessToken = '';
//                 state.refreshToken = '';
//                 state.user = null;
//             });
//     },
// });

// export const { setTokens, setAuthData, setUserRegistrationStatus } = authSlice.actions;
// export default authSlice.reducer;


