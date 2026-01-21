import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tokenStore } from '@/auth/tokenStore';
import { env } from '../../config/env';

interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'regular';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk<
  { accessToken: string; user: User },
  { email: string; password: string; source: 'admin' | 'client' },
  { rejectValue: { code: string; message: string } }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${env.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return rejectWithValue(data.error as { code: string; message: string });
    }

    // Store access token in memory
    tokenStore.setAccessToken(data.data.accessToken);

    // Store user in localStorage for display purposes (no sensitive data)
    localStorage.setItem('user', JSON.stringify(data.data.user));

    return data.data;
  } catch (err) {
    return rejectWithValue({
      message: 'An unexpected error occurred',
      code: 'NETWORK_ERROR',
    });
  }
});

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await fetch(`${env.apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      // Clear token from memory and localStorage
      tokenStore.clearAccessToken();
      localStorage.removeItem('user');
    } catch (err) {
      // Even if request fails, clear local state
      tokenStore.clearAccessToken();
      localStorage.removeItem('user');
      return rejectWithValue({
        message: 'Logout failed',
        code: 'LOGOUT_ERROR',
      });
    }
  }
);

// Async thunk for initializing auth on app start (refresh flow)
export const initializeAuth = createAsyncThunk<
  { user: User | null },
  void,
  { rejectValue: { code: string; message: string } }
>(
  'auth/initialize',
  async (_) => {
    try {
      const response = await fetch(
        `${env.apiUrl}/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include', // Include cookies
        }
      );

      if (!response.ok) {
        // Refresh failed, user needs to login
        tokenStore.clearAccessToken();
        localStorage.removeItem('user');
        return { user: null };
      }

      const data = await response.json();

      if (!data.data?.accessToken) {
        throw new Error('Invalid refresh response');
      }

      // Store new access token in memory
      tokenStore.setAccessToken(data.data.accessToken);

      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User data not found');
      }

      const user = JSON.parse(userStr);
      if (!user?.user_id || !user?.email || !user?.role) {
        throw new Error('Invalid user data');
      }
      return { user };
    } catch (err) {
      tokenStore.clearAccessToken();
      localStorage.removeItem('user');
      // Resolve with null user instead of rejecting to avoid global error handlers on init
      return { user: null };
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.code || 'NETWORK_ERROR';
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even on failure, tokens are cleared locally, so reset state
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Initialize auth cases
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        } else {
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export default authSlice.reducer;
