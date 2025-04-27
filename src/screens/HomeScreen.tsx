import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Recipe, Category } from '../types/recipe';
import { recipeService, verifyApiKey } from '../services/api';
import { AuthContext } from '../navigation/AppNavigator';
import { authService } from '../services/auth';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Ana ekran bileşeni - Uygulamanın merkezi arayüzünü oluşturur
export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Tarif yükleme fonksiyonu - API'den tarifleri getirir
  const loadRecipes = async (category: string = 'all', search: string = '') => {
    try {
      setIsLoading(true);
      setError(null);
      let results: Recipe[];
      
      if (search) {
        results = await recipeService.searchRecipes(search);
      } else if (category !== 'all') {
        results = await recipeService.getRecipesByCategory(category);
      } else {
        results = await recipeService.getRecipes();
      }
      
      setRecipes(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recipes. Please try again.';
      setError(errorMessage);
      console.error('Error loading recipes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const verifyAndLoadRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First verify the API key
        const isValid = await verifyApiKey();
        if (!isValid) {
          setError('Invalid or expired API key. Please check your Spoonacular API key.');
          return;
        }
        
        // If API key is valid, load recipes
        await loadRecipes(selectedCategory, searchQuery);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load recipes. Please try again.';
        setError(errorMessage);
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndLoadRecipes();
  }, [selectedCategory]);

  const handleSearch = () => {
    loadRecipes(selectedCategory, searchQuery);
  };

  const handleRecipePress = async (recipe: Recipe) => {
    try {
      const fullRecipe = await recipeService.getRecipeById(recipe.id);
      navigation.navigate('RecipeDetail', { recipe: fullRecipe });
    } catch (err) {
      console.error('Error loading recipe details:', err);
      navigation.navigate('RecipeDetail', { recipe });
    }
  };

  // Kategori verileri - Uygulamada kullanılacak kategorileri tanımlar
  const categories: Category[] = [
    { 
      id: 'all', 
      name: 'All', 
      image: 'https://cdn-icons-png.flaticon.com/512/1046/1046874.png'
    },
    { 
      id: 'main course', 
      name: 'Main Course', 
      image: 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png'
    },
    { 
      id: 'soup', 
      name: 'Soup', 
      image: 'https://cdn-icons-png.flaticon.com/512/1046/1046876.png'
    },
    { 
      id: 'salad', 
      name: 'Salad', 
      image: 'https://cdn-icons-png.flaticon.com/512/1046/1046869.png'
    },
    { 
      id: 'dessert', 
      name: 'Dessert', 
      image: 'https://cdn-icons-png.flaticon.com/512/1046/1046878.png'
    },
  ];

  // Kategori öğesi render fonksiyonu - Her kategori için görünüm oluşturur
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(item.id)}
      style={styles.categoryButton}
    >
      <View style={styles.categoryIcon}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.iconImage}
        />
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Tarif öğesi render fonksiyonu - Her tarif için görünüm oluşturur
  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeAuthor}>by {item.author}</Text>
        <Text style={styles.recipeCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  // Ana ekran görünümü
  return (
    <View style={styles.container}>
      {/* Arama bölümü */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Kategori başlığı */}
      <Text style={styles.sectionTitle}>Categories</Text>

      {/* Kategori listesi */}
      <FlatList<Category>
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      />

      {/* Hata mesajı gösterimi */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadRecipes(selectedCategory, searchQuery)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Yükleme göstergesi */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
        </View>
      ) : (
        /* Tarif listesi */
        <FlatList<Recipe>
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recipesContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// Stil tanımlamaları
const styles = StyleSheet.create({
  // Ana konteyner stili
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Arama bölümü stilleri
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 25,
    fontSize: 16,
  },
  // Kategori bölümü stilleri
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingLeft: 16,
    marginBottom: 24,
    height: 90,
  },
  categoryButton: {
    width: 80,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 80,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconImage: {
    width: 30,
    height: 30,
    tintColor: '#666',
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipesContainer: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 200,
  },
  recipeInfo: {
    padding: 16,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 14,
    color: '#999',
  },
  logoutButton: {
    marginRight: 16,
  },
  logoutText: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 