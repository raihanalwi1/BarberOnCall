import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

// 1. Mock Data: Ceritanya ada 2 riwayat transaksi
const MOCK_HISTORY = [
  {
    id: 'BOC-782190',
    service: 'Haircut + Head Massage Premium',
    date: '13 Juni 2026',
    price: 'Rp 77.000',
    status: 'Selesai',
  },
  {
    id: 'BOC-110293',
    service: 'Gentlemen Hair Dyeing (Pewarnaan)',
    date: '28 Mei 2026',
    price: 'Rp 120.000',
    status: 'Selesai',
  },
];

export default function HistoryScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Riwayat Pesanan</Text>

      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.historyCard}
            // 🛑 SEKARANG DIKIRIM BERBENTUK OBJEK 'order' SESUAI TYPE NAVIGATOR LU
            onPress={() => navigation.navigate('HistoryDetail', { 
              order: {
                orderId: item.id,
                service: item.service,
                date: item.date,
                price: item.price,
                status: item.status,
                customerName: 'Raihan Alwi Noer',
                address: item.id === 'BOC-782190' 
                  ? 'Harapan Indah, Blok C4 No. 12, Bekasi, Jawa Barat' 
                  : 'Jl. Boulevard Raya No. 45, Kelapa Gading, Jakarta Utara',
                addressNotes: item.id === 'BOC-782190'
                  ? 'Rumah pagar hitam, depan warung Madura.'
                  : 'Kantor ruko lantai 2, sebelah barbershop lama.'
              }
            })}
          >
            {/* ... Sisa komponen Text dll di dalam card tetep sama ... */}
            <View style={styles.cardHeader}>
              <Text style={styles.orderIdText}>{item.id}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            
            <Text style={styles.serviceText}>{item.service}</Text>
            
            <View style={styles.cardFooter}>
              <Text style={styles.dateText}>📅 {item.date}</Text>
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 60 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e1e24', marginBottom: 20 },
  historyCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e1e4e8', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderIdText: { fontSize: 13, fontWeight: 'bold', color: '#666' },
  statusBadge: { backgroundColor: '#e8f5e9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  statusText: { color: '#2b9348', fontSize: 11, fontWeight: 'bold' },
  serviceText: { fontSize: 15, fontWeight: 'bold', color: '#1e1e24', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f2', paddingTop: 10 },
  dateText: { fontSize: 12, color: '#999' },
  priceText: { fontSize: 14, fontWeight: 'bold', color: '#e63946' },
});