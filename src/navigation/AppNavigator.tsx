import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Import Screens & Tab
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DetailOrderScreen from '../screens/DetailOrderScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen'; // Import Baru
import TabNavigator from './TabNavigator';

// Struktur rute global aplikasi
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
  DetailOrder: undefined;
  Result: { orderId: string };
  History: undefined; // Nggak butuh parameter pas masuk list
 
  
  // Update di bagian HistoryDetail ini:
  HistoryDetail: { 
    order: { 
      orderId: string; 
      service: string; 
      date: string; 
      price: string; 
      status: string; 
      customerName: string; 
      address: string;
      addressNotes?: string; // 👈 TAMBAHKAN BARIS INI
    } 
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainApp" component={TabNavigator} />
        <Stack.Screen name="DetailOrder" component={DetailOrderScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        
        {/* Pasang Layar Detail Riwayat di Sini */}
        <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}