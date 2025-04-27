// Kimlik doğrulama servisi - Kullanıcı girişi ve kayıt işlemlerini yönetir
import { User, LoginCredentials } from '../types/auth';
import { databaseService } from './database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kullanıcı verilerini saklamak için basit bir bellek deposu
// Not: Gerçek uygulamada bu veriler güvenli bir şekilde saklanmalıdır
const users: User[] = [];

// Kimlik doğrulama servisi - Tüm kimlik doğrulama işlemlerini yönetir
export const authService = {
  // Kullanıcı kaydı - Yeni kullanıcı oluşturur
  async register(userData: User): Promise<void> {
    try {
      // Check if username already exists
      const exists = await databaseService.checkUsername(userData.username);
      if (exists) {
        throw new Error('Username already exists');
      }
      await databaseService.registerUser(userData);
      await AsyncStorage.setItem('@current_user', userData.username);
    } catch (error) {
      throw error;
    }
  },

  // Kullanıcı girişi - Mevcut kullanıcıyı doğrular
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const user = await databaseService.findUser(credentials.username, credentials.password);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      await AsyncStorage.setItem('@current_user', credentials.username);
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Mevcut kullanıcıyı getir - Oturum durumunu kontrol eder
  async getCurrentUser(): Promise<User | null> {
    const username = await AsyncStorage.getItem('@current_user');
    if (!username) return null;
    return { username, password: '' };
  },

  // Çıkış yap - Oturumu sonlandırır
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('@current_user');
    return;
  },
}; 