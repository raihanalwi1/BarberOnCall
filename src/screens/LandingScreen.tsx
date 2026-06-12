import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { TabParamList } from '../navigation/TabNavigator';
import { useOrderStore } from '../store/useOrderStore';
import * as Location from 'expo-location'; // Import library GPS

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function LandingScreen({ navigation }: Props) {
  const { setServiceType, setLocation } = useOrderStore();
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getGPSLocation() {
      // 1. Minta izin akses lokasi ke HP user
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Izin akses GPS ditolak. Menggunakan lokasi default.');
        setLoadingLocation(false);
        return;
      }

      // 2. Jika diizinkan, ambil koordinat saat ini
      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        // 3. Simpan koordinat ke Zustand store
        setLocation(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setErrorMsg('Gagal mendapatkan lokasi akurat.');
      } finally {
        setLoadingLocation(false);
      }
    }

    getGPSLocation();
  }, []);

  const handleSelectService = (type: 'REGULER' | 'BISNIS') => {
    setServiceType(type);
    navigation.navigate('DetailOrder');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pilih Layanan Cukur</Text>

      {/* Indikator Status GPS */}
      {loadingLocation ? (
        <View style={styles.gpsStatus}>
          <ActivityIndicator size="small" color="#1e1e24" />
          <Text style={styles.gpsText}>Mencari lokasi GPS lu...</Text>
        </View>
      ) : errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <Text style={styles.successText}>📍 Lokasi lu berhasil dikunci!</Text>
      )}
      
      <TouchableOpacity style={styles.card} onPress={() => handleSelectService('REGULER')}>
        <Text style={styles.cardTitle}>💈 Layanan Reguler</Text>
        <Text style={styles.cardDesc}>Potong rambut standar top-tier. Rp 50.000</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.cardPremium]} onPress={() => handleSelectService('BISNIS')}>
        <Text style={styles.cardTitlePremium}>💼 Layanan Bisnis</Text>
        <Text style={styles.cardDescPremium}>Termasuk shaving, hair wash & pijat premium. Rp 120.000</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  gpsStatus: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  gpsText: { marginLeft: 8, color: '#666', fontSize: 14 },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 20, fontSize: 13 },
  successText: { color: 'green', textAlign: 'center', marginBottom: 20, fontSize: 13, fontWeight: '500' },
  card: { padding: 20, borderRadius: 12, backgroundColor: '#f0f0f3', marginBottom: 20 },
  cardPremium: { backgroundColor: '#1e1e24' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1e24' },
  cardTitlePremium: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  cardDesc: { color: '#666', marginTop: 5 },
  cardDescPremium: { color: '#ccc', marginTop: 5 }
});