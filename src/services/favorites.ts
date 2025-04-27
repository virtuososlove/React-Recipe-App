import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../types/recipe';

async function getCurrentUsername(): Promise<string | null> {
  return await AsyncStorage.getItem('@current_user');
}

function getFavoritesKey(username: string) {
  return `@favorite_recipes_${username}`;
}
function getRatingsKey(username: string) {
  return `@recipe_ratings_${username}`;
}

export const favoritesService = {
  async getFavorites(): Promise<Recipe[]> {
    const username = await getCurrentUsername();
    if (!username) return [];
    try {
      const favorites = await AsyncStorage.getItem(getFavoritesKey(username));
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  async addToFavorites(recipe: Recipe): Promise<void> {
    const username = await getCurrentUsername();
    if (!username) return;
    try {
      const favorites = await this.getFavorites();
      if (!favorites.some(fav => fav.id === recipe.id)) {
        const updatedFavorites = [...favorites, recipe];
        await AsyncStorage.setItem(getFavoritesKey(username), JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  },

  async removeFromFavorites(recipeId: string): Promise<void> {
    const username = await getCurrentUsername();
    if (!username) return;
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(fav => fav.id !== recipeId);
      await AsyncStorage.setItem(getFavoritesKey(username), JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  },

  async isFavorite(recipeId: string): Promise<boolean> {
    const username = await getCurrentUsername();
    if (!username) return false;
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.id === recipeId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }
};

export const ratingService = {
  async getRating(recipeId: string): Promise<number> {
    const username = await getCurrentUsername();
    if (!username) return 0;
    try {
      const ratings = await AsyncStorage.getItem(getRatingsKey(username));
      if (!ratings) return 0;
      const parsed = JSON.parse(ratings);
      return parsed[recipeId] || 0;
    } catch (error) {
      console.error('Error getting rating:', error);
      return 0;
    }
  },
  async setRating(recipeId: string, rating: number): Promise<void> {
    const username = await getCurrentUsername();
    if (!username) return;
    try {
      const ratings = await AsyncStorage.getItem(getRatingsKey(username));
      const parsed = ratings ? JSON.parse(ratings) : {};
      parsed[recipeId] = rating;
      await AsyncStorage.setItem(getRatingsKey(username), JSON.stringify(parsed));
    } catch (error) {
      console.error('Error setting rating:', error);
    }
  },
};

export const commentService = {
  async getComments(recipeId: string): Promise<{username: string, text: string, date: string}[]> {
    try {
      const comments = await AsyncStorage.getItem(`@recipe_comments_${recipeId}`);
      return comments ? JSON.parse(comments) : [];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  },
  async addComment(recipeId: string, username: string, text: string): Promise<void> {
    try {
      const comments = await this.getComments(recipeId);
      const newComment = { username, text, date: new Date().toISOString() };
      const updated = [...comments, newComment];
      await AsyncStorage.setItem(`@recipe_comments_${recipeId}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  },
}; 