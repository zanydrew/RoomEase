import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as favoriteService from "../services/favoriteService";
import useAuth from "./useAuth";
import { notify } from "../context/ToastConfig";

/**
 * Encapsulates the "toggle favorite" behavior used by every RoomCard:
 * - Guests are sent to /login instead of hitting the API.
 * - The heart updates optimistically, then rolls back on failure.
 */

let favoriteIds = null; // null = not loaded yet, Set once loaded
let loadingPromise = null;
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function ensureFavoritesLoaded() {
  if (favoriteIds || loadingPromise) return loadingPromise ?? Promise.resolve();

  loadingPromise = favoriteService
    .getMyFavorites()
    .then((res) => {
      const rooms = res.data?.data?.rooms || [];
      favoriteIds = new Set(rooms.map((room) => room.uuid));
    })
    .catch(() => {
      // Leave favoriteIds as null so a future mount retries the fetch;
      // in the meantime each card just keeps trusting its own initialFavorited.
    })
    .finally(() => {
      loadingPromise = null;
      notifyListeners();
    });

  return loadingPromise;
}

function setFavoriteId(roomId, isFavorited) {
  if (!favoriteIds) favoriteIds = new Set();
  if (isFavorited) {
    favoriteIds.add(roomId);
  } else {
    favoriteIds.delete(roomId);
  }
  notifyListeners();
}

function resetFavoritesCache() {
  favoriteIds = null;
  loadingPromise = null;
  notifyListeners();
}

export default function useFavorite(
  roomId,
  initialFavorited = false,
  onChange,
) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !roomId) {
      resetFavoritesCache();
      return undefined;
    }

    function syncFromCache() {
      if (favoriteIds) setIsFavorited(favoriteIds.has(roomId));
    }

    syncFromCache();
    ensureFavoritesLoaded().then(syncFromCache);

    listeners.add(syncFromCache);
    return () => listeners.delete(syncFromCache);
  }, [roomId, isAuthenticated]);

  async function toggleFavorite(event) {
    event?.preventDefault();
    event?.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const nextState = !isFavorited;
    setIsFavorited(nextState);
    setFavoriteId(roomId, nextState);
    setIsToggling(true);

    try {
      if (nextState) {
        await favoriteService.saveRoom(roomId);
      } else {
        await favoriteService.unsaveRoom(roomId);
      }
      onChange?.(roomId, nextState);
    } catch (err) {
      setIsFavorited(!nextState);
      setFavoriteId(roomId, !nextState);
      notify.error(err);
    } finally {
      setIsToggling(false);
    }
  }

  return { isFavorited, isToggling, toggleFavorite };
}
