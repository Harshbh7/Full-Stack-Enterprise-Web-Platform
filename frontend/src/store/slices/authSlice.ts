import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, Tenant } from '../../types/index.js';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('edusphere_access_token'),
  tenant: null,
  isAuthenticated: !!localStorage.getItem('edusphere_access_token'),
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; tenant?: Tenant }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.tenant) {
        state.tenant = action.payload.tenant;
      }
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('edusphere_access_token', action.payload.token);
    },
    setTenantContext: (state, action: PayloadAction<Tenant>) => {
      state.tenant = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.tenant = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('edusphere_access_token');
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, setTenantContext, logout, setAuthLoading, setAuthError } =
  authSlice.actions;

export default authSlice.reducer;
