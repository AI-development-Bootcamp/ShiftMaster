import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices here as they are created
// import authReducer from './slices/authSlice';

// Placeholder reducer until actual slices are created
// This prevents Redux from throwing an error about empty reducers
const placeholderReducer = (state = {}) => state;

export const store = configureStore({
  reducer: {
    // Temporary placeholder - remove this when you add your first real reducer
    _placeholder: placeholderReducer,
    // Add reducers here
    // auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [],
        // Ignore these field paths in all actions
        ignoredActionPaths: [],
        // Ignore these paths in the state
        ignoredPaths: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
