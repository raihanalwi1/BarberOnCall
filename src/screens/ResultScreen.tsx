import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native'; // <-- Tambah BackHandler
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useOrderStore } from '../store/useOrderStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const resetOrder = useOrderStore((state) => state.resetOrder);

  const [serviceName, setServiceName] = useState('Memuat...');
  const [loadingService, setLoadingService] = useState(true);

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

  // 🔥 FUNGSI UTAMA: Reset data & bersihin Stack Navigation
  const handleGoHome = () => {
    resetOrder(); // Reset state orderan di Zustand biar bersih
    
    // Reset navigasi ke MainApp, tumpukan halaman checkout lama bakal dihapus total
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  // 🛠️ FIX NYA DI SINI: Kunci tombol back HP bawaan (Android)
  useEffect(() => {
    const backAction = () => {
      handleGoHome(); // Kalau user pencet back di HP, paksa jalanin fungsi pulang ke home
      return true; // return true artinya kita nge-gembok fungsi back bawaan biar gak mundur ke DetailOrder
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Bersihin listener pas pindah halaman
  }, []);

  // 🔄 AMBIL DETAIL LAYANAN
  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const response = await fetch('http://192.168.2.4:3000/api/services');
        const result = await response.json();
        
        if (result.success) {
          const matched = result.data.find(
            (s: any) => s.id.toString() === currentOrder.serviceType?.toString()
          );
          if (matched) {
            setServiceName(matched.name);
          } else {
            setServiceName('Layanan Cukur');
          }
        }
      } catch (error) {
        console.error('Gagal mengambil detail nama layanan:', error);
        setServiceName('Layanan Terpilih');
      } finally {
        setLoadingService(false);
      }
    };

    fetchServiceDetail();
  }, [currentOrder.serviceType]);

  return (
    <View style={styles.container}>
      {/* Bagian Status Sukses */}
      <View style={styles.successHeader}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={styles.successText}>Pesanan Berhasil!</Text>
        <Text style={styles.orderId}>Order ID: {orderId}</Text>
      </View>

      {/* 📋 Ringkasan Kotak Informasi Data Pesanan */}
      <View style={styles.infoBox}>
        <Text style={styles.boxTitle}>Detail Transaksi</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama Pelanggan</Text>
          <Text style={styles.infoValue}>{currentOrder.customerName || 'Pelanggan'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Layanan</Text>
          {loadingService ? (
            <ActivityIndicator size="small" color="#8b5cf6" />
          ) : (
            <Text style={styles.infoValue}>{serviceName}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Metode Bayar</Text>
          <Text style={styles.infoValue}>Tunai (COD)</Text> 
        </View>

        <View style={styles.lineDivider} />

        <View style={styles.infoRow}>
          <Text style={styles.totalLabel}>Total Biaya</Text>
          <Text style={styles.totalValue}>{formatRupiah(currentOrder.totalFee || 0)}</Text>
        </View>
      </View>

      <Text style={styles.noticeText}>
        Kapster kami akan segera meluncur ke lokasi tempat tinggal lu. Harap pantau terus nomor HP lu ya bes! 👍
      </Text>

      {/* Tombol Kembali ke Home menggunakan fungsi handleGoHome yang baru */}
      <TouchableOpacity style={styles.btnHome} onPress={handleGoHome}>
        <Text style={styles.btnHomeText}>Kembali ke Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FAFAFA', justifyContent: 'center' },
  successHeader: { alignItems: 'center', marginBottom: 30 },
  successIcon: { fontSize: 50, marginBottom: 10 },
  successText: { fontSize: 26, fontWeight: '800', color: '#10b981', textAlign: 'center' },
  orderId: { fontSize: 15, textAlign: 'center', color: '#666', marginTop: 4, fontWeight: '500' },
  
  infoBox: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  boxTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: 10 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', textAlign: 'right', flex: 1, marginLeft: 20 },
  
  lineDivider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 14 },
  
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#8b5cf6' },
  
  noticeText: { fontSize: 13, color: '#718096', textAlign: 'center', lineHeight: 18, marginBottom: 40, paddingHorizontal: 10 },
  btnHome: { backgroundColor: '#1E1E24', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnHomeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 }
});