import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFocusEffect } from '@react-navigation/native'; // 🌟 Ditambahin biar auto-refresh
import { getOrderStatusInfo } from '../utils/orderHelper'; // 🌟 Import helper status

import { AuthContext } from '../navigation/AuthContext'; 

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const { userId } = useContext(AuthContext);
  const [history, setHistory] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]); // 🌟 State baru buat nampung daftar layanan
  const [loading, setLoading] = useState(true);

  // 🔄 Tarik data history & service barengan pas halaman dibuka
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!userId) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true); // Pastikan loading nyala pas mulai fetch
          
          // 🔥 Promise.all biar narik 2 API sekaligus, jadi aplikasinya lebih ngebut
          const [historyRes, servicesRes] = await Promise.all([
            fetch(`http://192.168.2.4:3000/api/orders/history/${userId}`),
            fetch(`http://192.168.2.4:3000/api/services`)
          ]);

          const historyData = await historyRes.json();
          const servicesData = await servicesRes.json();

          setHistory(historyData);
          if (servicesData.success) {
            setServices(servicesData.data);
          }
        } catch (error) {
          console.error('Gagal tarik data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [userId])
  );

  // 🛠️ FUNGSI BARU: Nyocokin ID Layanan jadi Nama Aslinya
  const getServiceName = (serviceId: any) => {
    const matched = services.find((s) => s.id.toString() === serviceId?.toString());
    return matched ? matched.name : 'Layanan Cukur'; 
  };

  const formatRupiah = (angka: number) => {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    const safeStatus = status ? status.toLowerCase() : '';
    
    if (safeStatus.includes('selesai')) {
      return { bg: '#e8f5e9', text: '#2b9348' }; 
    } else if (safeStatus.includes('menuju')) {
      return { bg: '#e0f2fe', text: '#0284c7' }; 
    } else if (safeStatus.includes('berlangsung') || safeStatus.includes('sedang')) {
      return { bg: '#f3e8ff', text: '#9333ea' }; 
    } else if (safeStatus.includes('menunggu') || safeStatus.includes('diproses')) {
      return { bg: '#fff3cd', text: '#d97706' }; 
    } else if (safeStatus.includes('batal') || safeStatus.includes('tidak berhasil')) {
      return { bg: '#fde8e8', text: '#e63946' }; 
    } else {
      return { bg: '#f0f0f2', text: '#666666' }; 
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
            const statusColor = getStatusColor(item.status);
            const actualServiceName = getServiceName(item.service); // 🌟 Ambil nama aslinya di sini

            return (
              <TouchableOpacity 
                style={styles.historyCard}
                onPress={() => navigation.getParent()?.navigate('HistoryDetail', { 
                  order: {
                    orderId: item.id,
                    service: actualServiceName, // 🌟 Pas diklik, data yang dikirim udah nama aslinya
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
                  
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
                  </View>
                </View>
                
                {/* 🌟 TAMPILIN NAMA LAYANANNYA DI CARD */}
                <Text style={styles.serviceText}>{actualServiceName}</Text> 
                
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
  
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  
  serviceText: { fontSize: 15, fontWeight: 'bold', color: '#1e1e24', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f2', paddingTop: 10 },
  dateText: { fontSize: 12, color: '#999' },
  priceText: { fontSize: 14, fontWeight: 'bold', color: '#e63946' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#666' }
});