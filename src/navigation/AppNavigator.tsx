import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import { AuthContext } from './AuthContext';

// Import Screens & Tab
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DetailOrderScreen from '../screens/DetailOrderScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen'; // 🔥 INI DITAMBAHIN
import HistoryDetailScreen from '../screens/HistoryDetailScreen'; 
import TabNavigator from './TabNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
  DetailOrder: undefined;
  Result: { orderId: string };
  History: undefined; 
  HistoryDetail: { 
    order: { 
      orderId: string; 
      service: string; 
      date: string; 
      price: string; 
      status: string; 
      customerName: string; 
      address: string;
      addressNotes?: string; 
    } 
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); 
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); 

  useEffect(() => {
    const checkSavedSession = async () => {
      try {
        const savedUserId = await AsyncStorage.getItem('user_id'); 
        if (savedUserId !== null) {
          setUserId(savedUserId);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Gagal memuat session login:', error);
      } finally {
        setIsCheckingAuth(false); 
      }
    };

    checkSavedSession();
  }, []);

  const login = async (id: string) => {
    try {
      await AsyncStorage.setItem('user_id', id); 
      setUserId(id);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Gagal menyimpan session login:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_id'); 
      setUserId(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Gagal menghapus session login:', error);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f7' }}>
        <ActivityIndicator size="large" color="#1e1e24" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {!isLoggedIn ? (
            <>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="MainApp" component={TabNavigator} />
              <Stack.Screen name="DetailOrder" component={DetailOrderScreen} />
              <Stack.Screen name="Result" component={ResultScreen} />
              {/* 🔥 HISTORY DIDAFTARIN DI SINI BIAR GAK UNDEFINED */}
              <Stack.Screen name="History" component={HistoryScreen as React.ComponentType<any>} />
              <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
            </>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}