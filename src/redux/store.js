import { configureStore } from '@reduxjs/toolkit';

import { shazamCoreApi } from './services/shazamCore';
import playerReducer from './features/playerSlice';
import favoritesSlice from './features/favoriteSlice';

export const store = configureStore({
  reducer: {
    [shazamCoreApi.reducerPath]: shazamCoreApi.reducer,
    player: playerReducer,
    favorites: favoritesSlice,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(shazamCoreApi.middleware),
});
