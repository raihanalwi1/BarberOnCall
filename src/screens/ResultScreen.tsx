import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useOrderStore } from '../store/useOrderStore';
import MapView, { Marker } from 'react-native-maps';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const resetOrder = useOrderStore((state) => state.resetOrder);

  // Simulasi Koordinat Live Tracking Tukang Cukur mendekati User
  const [barberCoords, setBarberCoords] = useState({
    latitude: currentOrder.latitude + 0.003,
    longitude: currentOrder.longitude + 0.003,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setBarberCoords((prev) => ({
        latitude: prev.latitude - 0.0005,
        longitude: prev.longitude - 0.0005,
      }));
    }, 3000); // Gerak tiap 3 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>🎉 Pesanan Berhasil!</Text>
      <Text style={styles.orderId}>Order ID: {orderId}</Text>

      <View style={styles.infoBox}>
        <Text>Nama: {currentOrder.customerName}</Text>
        <Text>Layanan: {currentOrder.serviceType}</Text>
        <Text>Pembayaran: {currentOrder.paymentMethod}</Text>
        <Text style={{fontWeight: 'bold'}}>Total: Rp {currentOrder.totalFee.toLocaleString()}</Text>
      </View>

      <Text style={styles.trackTitle}>🚴 Live Track Tukang Cukur:</Text>
      
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentOrder.latitude,
          longitude: currentOrder.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Penanda Lokasi Rumah User */}
        <Marker coordinate={{ latitude: currentOrder.latitude, longitude: currentOrder.longitude }} title="Lokasi Lu" pinColor="blue" />
        {/* Penanda Lokasi Tukang Cukur yang Bergerak */}
        <Marker coordinate={barberCoords} title="Tukang Cukur" pinColor="red" />
      </MapView>

      {/* 🛠️ FIX: Komentar perbaikan tadi sudah dihapus agar tidak dibaca sebagai string teks bebas */}
      <TouchableOpacity style={styles.btnHome} onPress={() => { resetOrder(); navigation.navigate('MainApp'); }}>
        <Text style={styles.btnHomeText}>Kembali ke Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 60 },
  successText: { fontSize: 24, fontWeight: 'bold', color: '#2a9d8f', textAlign: 'center' },
  orderId: { fontSize: 16, textAlign: 'center', color: '#666', marginVertical: 5 },
  infoBox: { padding: 15, backgroundColor: '#f0f0f3', borderRadius: 8, marginVertical: 15 },
  trackTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  map: { flex: 1, borderRadius: 12, marginBottom: 20 },
  btnHome: { backgroundColor: '#1e1e24', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnHomeText: { color: '#fff', fontWeight: 'bold' }
});