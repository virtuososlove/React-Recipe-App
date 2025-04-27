// Tarif detay ekranı - Seçilen tarifin detaylı bilgilerini gösterir
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Recipe } from '../types/recipe';
import { favoritesService } from '../services/favorites';
import { ratingService } from '../services/favorites';
import { commentService } from '../services/favorites';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tarif detay ekranı bileşeni
export default function RecipeDetailScreen({
  route,
}: {
  route: RouteProp<RootStackParamList, 'RecipeDetail'>;
}) {
  const { recipe } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState<{username: string, text: string, date: string}[]>([]);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    checkFavorite();
    loadRating();
    loadComments();
    loadCurrentUser();
  }, []);

  const checkFavorite = async () => {
    const fav = await favoritesService.isFavorite(recipe.id);
    setIsFavorite(fav);
  };

  const loadRating = async () => {
    const savedRating = await ratingService.getRating(recipe.id);
    setRating(savedRating);
  };

  const loadComments = async () => {
    const loaded = await commentService.getComments(recipe.id);
    setComments(loaded);
  };

  const loadCurrentUser = async () => {
    const username = await AsyncStorage.getItem('@current_user');
    setCurrentUser(username || '');
  };

  const handleSetRating = async (star: number) => {
    setRating(star);
    await ratingService.setRating(recipe.id, star);
  };

  const toggleFavorite = async () => {
    if (isFavorite) {
      await favoritesService.removeFromFavorites(recipe.id);
      setIsFavorite(false);
    } else {
      await favoritesService.addToFavorites(recipe);
      setIsFavorite(true);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await commentService.addComment(recipe.id, currentUser, commentText.trim());
    setCommentText('');
    loadComments();
  };

  // Malzeme listesi render fonksiyonu
  const renderIngredients = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {recipe.ingredients.map((ingredient, index) => (
        <View key={index} style={styles.ingredientItem}>
          <Image source={{ uri: ingredient.image }} style={styles.ingredientImage} />
          <Text style={styles.ingredientText}>
            {ingredient.amount} {ingredient.unit} {ingredient.name}
          </Text>
        </View>
      ))}
    </View>
  );

  // Yapılış adımları render fonksiyonu
  const renderInstructions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Instructions</Text>
      {recipe.instructions.map((instruction, index) => (
        <View key={index} style={styles.instructionItem}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
          <Text style={styles.instructionText}>{instruction}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Tarif görseli */}
        <Image source={{ uri: recipe.image }} style={styles.image} />

        {/* Tarif başlığı */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{recipe.name}</Text>
            <Text style={styles.author}>by {recipe.author}</Text>
            <View style={styles.ratingRow}>
              {[1,2,3,4,5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleSetRating(star)}>
                  <Text style={star <= rating ? styles.starFilled : styles.starEmpty}>
                    {star <= rating ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity onPress={toggleFavorite} style={styles.heartButton} activeOpacity={0.7}>
            <Image
              source={isFavorite ? require('../assets/heart-filled.png') : require('../assets/heart-add.png')}
              style={styles.heartIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Prep: {recipe.prepTime} min | Cook: {recipe.cookTime} min
          </Text>
          <Text style={styles.infoText}>Servings: {recipe.servings}</Text>
        </View>

        {/* Malzeme listesi */}
        {renderIngredients()}

        {/* Yapılış adımları */}
        {renderInstructions()}

        {/* Yorumlar */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Yorumlar</Text>
          {comments.length === 0 ? (
            <Text style={styles.noComments}>Henüz yorum yok.</Text>
          ) : (
            comments.map((c, i) => (
              <View key={i} style={styles.commentItem}>
                <Text style={styles.commentUser}>{c.username}</Text>
                <Text style={styles.commentText}>{c.text}</Text>
                <Text style={styles.commentDate}>{new Date(c.date).toLocaleString()}</Text>
              </View>
            ))
          )}
          <View style={styles.addCommentRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Yorum ekle..."
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity style={styles.addCommentButton} onPress={handleAddComment}>
              <Text style={styles.addCommentButtonText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  // Görsel stili
  image: {
    width: '100%',
    height: 250,
  },
  // Başlık bölümü stilleri
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  // Bilgi konteyneri stili
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  // Bilgi metin stili
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  heartButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: -30,
    top: '50%',
    transform: [{ translateY: -50 }],
    zIndex: 10,
  },
  heartIcon: {
    width: 100,
    height: 100,
  },
  // Bölüm başlığı stili
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  // Malzeme öğesi stilleri
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 16,
  },
  // Yapılış adımı stilleri
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6b6b',
    color: 'white',
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 10,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 4,
  },
  starFilled: {
    fontSize: 32,
    color: '#FFD700',
    marginHorizontal: 2,
  },
  starEmpty: {
    fontSize: 32,
    color: '#CCC',
    marginHorizontal: 2,
  },
  commentsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noComments: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  commentItem: {
    marginBottom: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 10,
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#6B4EFF',
  },
  commentText: {
    fontSize: 16,
    marginVertical: 2,
  },
  commentDate: {
    fontSize: 12,
    color: '#aaa',
    alignSelf: 'flex-end',
  },
  addCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  addCommentButton: {
    backgroundColor: '#6B4EFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addCommentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 