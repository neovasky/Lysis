/**
 * File: src/store/store.ts
 * Description: Redux store configuration
 */

import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "./slices/fileSlice";

export const store = configureStore({
  reducer: {
    files: fileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ["files/addFile"],
        ignoredPaths: ["files.files"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
