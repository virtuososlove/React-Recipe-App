import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { databaseService } from './src/services/database';

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      await databaseService.initDatabase();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
