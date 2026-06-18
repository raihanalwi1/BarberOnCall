import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    // Simulasi loading screen selama 2 detik lalu pindah ke Login
    setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Panggil logo dari file photo_6168025387766583570_y.jpg */}
      <Image 
        source={require('../../assets/logo.jpg')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#e63946" style={{ marginTop: 30 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', // Latar belakang putih biar logo makin keluar warnanya
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logo: { 
    width: 250, 
    height: 250 // Sesuaikan ukuran logo lu biar pas
  }
});