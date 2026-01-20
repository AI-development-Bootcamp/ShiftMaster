import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
    user_id: string;
    full_name: string;
    email: string;
    role: 'admin' | 'regular';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// Async thunk for login
// Async thunk for login
export const loginUser = createAsyncThunk<
    { token: string; user: User },
    { email: string; password: string; source: 'admin' | 'client' },
    { rejectValue: { code: string; message: string } }
>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.error as { code: string; message: string });
            }

            // Persist to localStorage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            return data.data;
        } catch (err) {
            return rejectWithValue({
                message: 'An unexpected error occurred',
                code: 'NETWORK_ERROR',
            });
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        initializeAuth: (state) => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if (token && userStr) {
                try {
                    state.token = token;
                    state.user = JSON.parse(userStr);
                    state.isAuthenticated = true;
                } catch (e) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                // Safely access code if payload exists
                state.error = action.payload?.code || 'NETWORK_ERROR';
            });
    },
});

export const { logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;