import * as SQLite from 'expo-sqlite';
import { User } from '../types/auth';

let db: SQLite.SQLiteDatabase | null = null;

export const databaseService = {
  async initDatabase(): Promise<void> {
    try {
      db = await SQLite.openDatabaseAsync('recipee.db');
      if (!db) throw new Error('Failed to open database');

      await db.execAsync(
        'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)'
      );
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  },

  async registerUser(userData: User): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      await db.runAsync(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [userData.username, userData.password]
      );
    } catch (error) {
      console.error('Register user error:', error);
      throw new Error('Username already exists');
    }
  },

  async findUser(username: string, password: string): Promise<User | null> {
    if (!db) throw new Error('Database not initialized');

    try {
      const user = await db.getFirstAsync<User>(
        'SELECT username, password FROM users WHERE username = ? AND password = ?',
        [username, password]
      );
      return user || null;
    } catch (error) {
      console.error('Find user error:', error);
      throw error;
    }
  },

  async checkUsername(username: string): Promise<boolean> {
    if (!db) throw new Error('Database not initialized');

    try {
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE username = ?',
        [username]
      );
      return (result?.count ?? 0) > 0;
    } catch (error) {
      console.error('Check username error:', error);
      throw error;
    }
  }
}; 