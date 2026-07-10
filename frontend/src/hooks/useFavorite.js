import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as favoriteService from '../services/favoriteService';
import useAuth from './useAuth';
import { notify } from '../context/ToastConfig';

/**
 * Encapsulates the "toggle favorite" behavior used by every RoomCard:
 * - Guests are sent to /login instead of hitting the API.
 * - The heart updates optimistically, then rolls back on failure.
 */
export default function useFavorite(roomId, initialFavorited = false, onChange) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isToggling, setIsToggling] = useState(false);

  async function toggleFavorite(event) {
    event?.preventDefault();
    event?.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const nextState = !isFavorited;
    setIsFavorited(nextState);
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
      notify.error(err);
    } finally {
      setIsToggling(false);
    }
  }

  return { isFavorited, isToggling, toggleFavorite };
}
