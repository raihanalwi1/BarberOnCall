import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// 📥 Import AuthContext buat ngambil userId yang lagi login
import { AuthContext } from '../navigation/AuthContext'; 

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const { userId } = useContext(AuthContext);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // ⚠️ PENTING: Ganti IP sesuai IP WiFi Laptop lu (Kayak yang di DetailOrderScreen)
        const response = await fetch(`http://192.168.2.4:3000/api/orders/history/${userId}`);
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Gagal tarik history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const formatRupiah = (angka: number) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // 🎨 FUNGSI BARU: Bikin warna status dinamis sesuai teks
  const getStatusColor = (status: string) => {
    const safeStatus = status ? status.toLowerCase() : '';
    
    if (safeStatus.includes('selesai')) {
      return { bg: '#e8f5e9', text: '#2b9348' }; // Hijau (Selesai)
    } else if (safeStatus.includes('menuju')) {
      return { bg: '#e0f2fe', text: '#0284c7' }; // Biru (Otw Lokasi)
    } else if (safeStatus.includes('berlangsung') || safeStatus.includes('sedang')) {
      return { bg: '#f3e8ff', text: '#9333ea' }; // Ungu (Lagi Dicukur)
    } else if (safeStatus.includes('menunggu') || safeStatus.includes('diproses')) {
      return { bg: '#fff3cd', text: '#d97706' }; // Kuning (Nunggu Barber)
    } else if (safeStatus.includes('batal') || safeStatus.includes('tidak berhasil')) {
      return { bg: '#fde8e8', text: '#e63946' }; // Merah (Batal)
    } else {
      return { bg: '#f0f0f2', text: '#666666' }; // Abu-abu
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1e1e24" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Riwayat Pesanan</Text>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Belum ada riwayat cukur nih, cuy.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            
            // 🎨 Ambil kode warna yang pas buat item ini
            const statusColor = getStatusColor(item.status);

            return (
              <TouchableOpacity 
                style={styles.historyCard}
                onPress={() => navigation.getParent()?.navigate('HistoryDetail', { 
                  order: {
                    orderId: item.id,
                    service: item.service,
                    date: formatDate(item.date),
                    price: formatRupiah(item.price), 
                    status: item.status,
                    customerName: item.customerName, 
                    contact: item.contact,
                    address: item.address,
                    addressNotes: item.addressNotes,
                  }
                })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.orderIdText}>BOC-{item.id}</Text>
                  
                  {/* 🎨 Terapkan warna dinamis ke Background & Text */}
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
                  </View>

                </View>
                
                <Text style={styles.serviceText}>{item.service}</Text>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  <Text style={styles.priceText}>{formatRupiah(item.price)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e1e24', marginBottom: 20 },
  historyCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e1e4e8' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderIdText: { fontSize: 13, fontWeight: 'bold', color: '#666' },
  
  // 🛠️ FIX: Hapus warna statis hijau dari sini, biarkan padding & margin saja
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  
  serviceText: { fontSize: 15, fontWeight: 'bold', color: '#1e1e24', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f2', paddingTop: 10 },
  dateText: { fontSize: 12, color: '#999' },
  priceText: { fontSize: 14, fontWeight: 'bold', color: '#e63946' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#666' }
});