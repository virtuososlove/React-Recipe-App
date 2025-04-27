import React, { useEffect, useState, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AuthScreen from '../screens/AuthScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Recipe } from '../types/recipe';
import { authService } from '../services/auth';
import { ActivityIndicator, View, Text, Image, TouchableOpacity } from 'react-native';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  RecipeDetail: { recipe: Recipe };
};

export type MainTabParamList = {
  Home: undefined;
  Favorites: undefined;
  Profile: undefined;
};

type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof MainTabParamList } }) => ({
        headerShown: route.name === 'Home',
        headerTitle: route.name === 'Home' ? 'Recipes' : '',
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 24,
        },
        headerRight: () =>
          route.name === 'Home' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  // Navigation to Logout will be handled in HomeScreen
                }}
              >
                <Text style={{ color: '#6B4EFF', fontSize: 16, fontWeight: '600' }}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : null,
        tabBarShowLabel: false,
        tabBarStyle: { height: 56 },
        tabBarItemStyle: { height: 52, width: 52, justifyContent: 'center', alignItems: 'center' },
        tabBarIcon: ({ focused }: { focused: boolean }) => {
          if (route.name === 'Home') {
            return (
              <Image
                source={require('../assets/home.png')}
                style={{ width: 75, height: 75, tintColor: focused ? '#6B4EFF' : '#999', alignSelf: 'center', marginTop: 27 }}
                resizeMode="contain"
              />
            );
          } else if (route.name === 'Favorites') {
            return (
              <Image
                source={require('../assets/heart-tab.png')}
                style={{ width: 98, height: 98, tintColor: focused ? '#e63946' : '#999', alignSelf: 'center', marginTop: 27 }}
                resizeMode="contain"
              />
            );
          } else if (route.name === 'Profile') {
            return (
              <Image
                source={require('../assets/profile.png')}
                style={{ width: 75, height: 75, tintColor: focused ? '#6B4EFF' : '#999', alignSelf: 'center', marginTop: 27 }}
                resizeMode="contain"
              />
            );
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <NavigationContainer>
        <Stack.Navigator>
          {!isAuthenticated ? (
            <Stack.Group screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Auth" component={AuthScreen} />
            </Stack.Group>
          ) : (
            <>
              <Stack.Screen 
                name="MainTabs" 
                component={MainTabs} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="RecipeDetail" 
                component={RecipeDetailScreen}
                options={({ route }) => ({ title: route.params.recipe.name })}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
} 