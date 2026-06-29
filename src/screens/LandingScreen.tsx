import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { TabParamList } from '../navigation/TabNavigator';
import { useOrderStore } from '../store/useOrderStore';
import * as Location from 'expo-location';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function LandingScreen({ navigation }: Props) {
  const formatRupiah = (price: any) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) return price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };
  
  const { setServiceType, setLocation } = useOrderStore();
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [services, setServices] = useState([]);
  
  const { width } = useWindowDimensions();
  // Hitung lebar card untuk HTML Render (Setengah layar dikurangin padding)
  const gridCardWidth = (width - 60) / 2; 

  useEffect(() => {
    async function getGPSLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Izin akses GPS ditolak. Menggunakan lokasi default.');
        setLoadingLocation(false);
        return;
      }
      
      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setErrorMsg('Gagal mendapatkan lokasi akurat.');
      } finally {
        setLoadingLocation(false);
      }
    }

    getGPSLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchServices = async () => {
        try {
          const res = await axios.get('http://192.168.2.4:3000/api/services'); 
          setServices(res.data.data);
        } catch (err) {
          console.log('Gagal ambil data dari server');
        }
      };
      fetchServices();
    }, [])
  );

  const handleSelectService = (type: string) => {
    setServiceType(type as any); 
    navigation.navigate('DetailOrder');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Mau cukur model apa hari ini?</Text>
          <Text style={styles.subtitle}>Pilih layanan, kapster kami meluncur.</Text>
        </View>

        {/* 📍 Indikator Status GPS */}
        <View style={styles.gpsContainer}>
          {loadingLocation ? (
            <View style={styles.gpsStatus}>
              <ActivityIndicator size="small" color="#8b5cf6" />
              <Text style={styles.gpsText}>Mencari lokasi lu...</Text>
            </View>
          ) : errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <View style={styles.gpsStatus}>
              <Text style={styles.successText}>📍 Lokasi berhasil dikunci</Text>
            </View>
          )}
        </View>

        {/* 📋 Daftar Layanan (Format Grid) */}
        <View style={styles.listContainer}>
          {services.length > 0 ? (
            services.map((service: any) => {
              const isDark = service.theme === 'dark'; 
              return (
                <TouchableOpacity 
                  key={service.id} 
                  style={[styles.card, isDark ? styles.cardDark : styles.cardLight]} 
                  onPress={() => handleSelectService(service.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, isDark && styles.textWhite]}>{service.name}</Text>
                    
                    <RenderHtml
                      contentWidth={gridCardWidth} // <-- Disetel lebih kecil biar pas di grid
                      source={{ html: service.description }}
                      defaultTextProps={{ numberOfLines: 3, ellipsizeMode: 'tail' }} // <-- Baris ditambah 3 karena kolomnya sempit
                      tagsStyles={{
                        body: { 
                          color: isDark ? '#A1A1AA' : '#666', 
                          fontSize: 12, // <-- Font dikecilin dikit biar muat
                          margin: 0,
                          padding: 0
                        },
                        p: { 
                          margin: 0, 
                          padding: 0 
                        }
                      }}
                    />
                  </View>
                  <View style={styles.priceTag}>
                    <Text style={[styles.priceText, isDark && styles.textWhite]}>
                      {formatRupiah(service.price)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ textAlign: 'center', color: '#666', width: '100%' }}>Sedang memuat layanan...</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#666' },
  
  gpsContainer: { marginBottom: 24, backgroundColor: '#fff', padding: 12, borderRadius: 10, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 }, android: { elevation: 2 } }) },
  gpsStatus: { flexDirection: 'row', alignItems: 'center' },
  gpsText: { marginLeft: 10, color: '#666', fontSize: 14, fontWeight: '500' },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: '500' },
  successText: { color: '#10b981', fontSize: 14, fontWeight: '600' },
  
  /* PERUBAHAN UTAMA UNTUK GRID DI SINI 👇 */
  listContainer: { 
    flexDirection: 'row',       // Bikin elemen berjejer ke samping
    flexWrap: 'wrap',           // Kalau mentok, otomatis turun ke bawah
    justifyContent: 'space-between', // Kasih jarak otomatis antar 2 kolom
  },
  card: { 
    width: '48%',               // Lebar card jadi 48% (sisanya 4% buat jarak di tengah)
    padding: 16, 
    borderRadius: 16, 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    minHeight: 170,             // Agak ditinggiin biar teksnya dapet napas
    marginBottom: 16,           // Jarak antar baris ke bawah
    ...Platform.select({ 
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }, 
      android: { elevation: 4 } 
    }) 
  },
  /* 👆 BATAS PERUBAHAN GRID 👆 */

  cardLight: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F0F0' },
  cardDark: { backgroundColor: '#1C1C1E' }, 
  
  cardContent: { flex: 1, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 }, // Font judul disesuaikan
  
  priceTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(139, 92, 246, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  priceText: { fontSize: 13, fontWeight: '700', color: '#8b5cf6' }, // Font harga disesuaikan
  
  textWhite: { color: '#FFFFFF' },
});