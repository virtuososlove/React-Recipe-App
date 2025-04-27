import axios, { AxiosError } from 'axios';
import { Recipe } from '../types/recipe';

// Spoonacular API servisi - Tarif verilerini yönetir
const API_KEY = 'dd35cf2e0a3e4ac6bf639a9392529897';
const API_BASE_URL = 'https://api.spoonacular.com/recipes';

// API hata yönetimi - Farklı hata durumlarını işler
const handleApiError = (error: AxiosError) => {
  if (error.response?.status === 402) {
    throw new Error('API quota exceeded or invalid API key. Please check your Spoonacular API key.');
  } else if (error.response?.status === 401) {
    throw new Error('Unauthorized. Please check your API key.');
  } else if (error.response) {
    const message = error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
      ? String(error.response.data.message)
      : 'Something went wrong';
    throw new Error(`API Error: ${message}`);
  } else if (error.request) {
    throw new Error('Network error. Please check your internet connection.');
  } else {
    throw new Error('An unexpected error occurred.');
  }
};

// Axios instance oluşturma - API istekleri için temel yapılandırma
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  params: {
    apiKey: API_KEY,
  },
});

// API yanıt interceptor'u - Tüm yanıtları kontrol eder
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(handleApiError(error));
  }
);

// Test function to verify API key
export const verifyApiKey = async () => {
  try {
    const response = await api.get('/random', {
      params: {
        number: 1,
      },
    });
    console.log('API Key verification successful');
    return true;
  } catch (error) {
    console.error('API Key verification failed:', error);
    return false;
  }
};

// Tarif sürelerini hesaplama - Hazırlama ve pişirme sürelerini düzenler
const calculateTimes = (recipe: any) => {
  // Önce açık hazırlama ve pişirme sürelerini kontrol et
  let prepTime = recipe.preparationMinutes;
  let cookTime = recipe.cookingMinutes;

  // Eğer bu bilgiler yoksa, toplam süreyi kullan
  if ((!prepTime || !cookTime) && recipe.readyInMinutes) {
    prepTime = Math.round(recipe.readyInMinutes * 0.33);
    cookTime = Math.round(recipe.readyInMinutes * 0.67);
  }

  // Alternatif alanları kontrol et
  if (!prepTime) {
    prepTime = recipe.prep_time || recipe.prepTime || 0;
  }
  if (!cookTime) {
    cookTime = recipe.cooking_time || recipe.cookTime || recipe.totalCookingTimeMinutes || 0;
  }

  return {
    prepTime: Math.max(0, prepTime),
    cookTime: Math.max(0, cookTime)
  };
};

// API yanıtını uygulama formatına dönüştürme
const transformRecipe = (apiRecipe: any): Recipe => {
  console.log('API Response:', JSON.stringify(apiRecipe, null, 2));
  const times = calculateTimes(apiRecipe);
  
  return {
    id: apiRecipe.id.toString(),
    name: apiRecipe.title,
    image: apiRecipe.image,
    category: apiRecipe.dishTypes?.[0] || 'Other',
    author: 'Spoonacular',
    servings: apiRecipe.servings || 4,
    prepTime: times.prepTime,
    cookTime: times.cookTime,
    ingredients: apiRecipe.extendedIngredients?.map((ing: any) => ({
      name: ing.original || ing.originalName || ing.name,
      amount: ing.amount,
      unit: ing.unit,
      image: `https://spoonacular.com/cdn/ingredients_100x100/${ing.image}`,
    })) || [],
    instructions: apiRecipe.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step) || [],
    tags: [...(apiRecipe.dishTypes || []), ...(apiRecipe.diets || [])],
  };
};

// Tarif servisi - Tüm tarif işlemlerini yönetir
export const recipeService = {
  // Tüm tarifleri getir
  async getRecipes(): Promise<Recipe[]> {
    try {
      const response = await api.get('/complexSearch', {
        params: {
          addRecipeInformation: true,
          fillIngredients: true,
          includeIngredients: true,
          instructionsRequired: true,
          number: 20,
        },
      });
      return response.data.results.map(transformRecipe);
    } catch (error) {
      throw error;
    }
  },

  // ID'ye göre tarif getir
  async getRecipeById(id: string): Promise<Recipe> {
    try {
      const response = await api.get(`/${id}/information`, {
        params: {
          includeNutrition: false,
        },
      });
      return transformRecipe(response.data);
    } catch (error) {
      throw error;
    }
  },

  // Tarif ara
  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      const response = await api.get('/complexSearch', {
        params: {
          query,
          addRecipeInformation: true,
          fillIngredients: true,
          includeIngredients: true,
          instructionsRequired: true,
          number: 20,
        },
      });
      return response.data.results.map(transformRecipe);
    } catch (error) {
      throw error;
    }
  },

  // Kategoriye göre tarif getir
  async getRecipesByCategory(category: string): Promise<Recipe[]> {
    try {
      const response = await api.get('/complexSearch', {
        params: {
          type: category,
          addRecipeInformation: true,
          fillIngredients: true,
          includeIngredients: true,
          instructionsRequired: true,
          number: 20,
        },
      });
      return response.data.results.map(transformRecipe);
    } catch (error) {
      throw error;
    }
  },
};