import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import CustomHeader from '../components/CustomHeader'; // 👈 Pakai komponen rakitan kita!

type Props = NativeStackScreenProps<RootStackParamList, 'HistoryDetail'>;

// Mock database mini yang sudah DISESUAIKAN dengan data pelanggan & lokasi dinamis
const DETAILS_DATABASE: Record<string, any> = {
  'BOC-782190': {
    service: 'Haircut + Head Massage Premium',
    price: 'Rp 75.000',
    appFee: 'Rp 2.000',
    total: 'Rp 77.000',
    date: '13 Juni 2026',
    barber: 'Abang Junaedi',
    method: 'E-Wallet (GoPay)',
    customerName: 'Raihan Alwi Noer',
    customerPhone: '081234567890',
    address: 'Harapan Indah, Blok C4 No. 12, Bekasi, Jawa Barat',
    notes: 'Rumah pagar hitam, depan warung Madura.'
  },
  'BOC-110293': {
    service: 'Gentlemen Hair Dyeing (Pewarnaan)',
    price: 'Rp 118.000',
    appFee: 'Rp 2.000',
    total: 'Rp 120.000',
    date: '28 Mei 2026',
    barber: 'Abang Supriadi',
    method: 'Tunai (COD)',
    customerName: 'Raihan Alwi Noer',
    customerPhone: '081234567890',
    address: 'Jl. Boulevard Raya No. 45, Kelapa Gading, Jakarta Utara',
    notes: 'Kantor ruko lantai 2, sebelah barbershop lama.'
  }
};

export default function HistoryDetailScreen({ route }: Props) {
  // 📥 AMBIL OBJEK 'order' DULU, BARU EKSTRAK ID-NYA
  const { order } = route.params;
  const orderId = order.orderId;

  // Tarik data spesifik berdasarkan ID
  const dataPesanan = DETAILS_DATABASE[orderId] || DETAILS_DATABASE['BOC-782190'];
  return (
    <View style={styles.container}>
      {/* HEADER MODULAR SAKTI */}
      <CustomHeader title="Detail Riwayat" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Status */}
        <View style={styles.statusBanner}>
          <Text style={styles.statusIcon}>✅</Text>
          <Text style={styles.statusText}>Pesanan Selesai</Text>
          <Text style={styles.statusSubtext}>Terima kasih sudah memotong rambut bersama kami!</Text>
        </View>

        {/* Info Utama Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Pesanan</Text>
            <Text style={styles.infoValueBold}>{orderId}</Text> 
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{dataPesanan.date}</Text>
          </View>
        </View>

        {/* Detail Layanan */}
        <Text style={styles.sectionTitle}>✂️ Detail Layanan</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoValueBold}>{dataPesanan.service}</Text>
            <Text style={styles.infoValue}>{dataPesanan.price}</Text>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Barber</Text>
            <Text style={styles.infoValue}>{dataPesanan.barber}</Text>
          </View>
        </View>

        {/* 📍 SEKSI BARU: Lokasi & Penerima Dinamis (Sudah Disesuaikan) */}
        <Text style={styles.sectionTitle}>📍 Lokasi & Penerima</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoValueBold}>{dataPesanan.customerName}</Text>
          <Text style={styles.addressContactText}>📱 {dataPesanan.customerPhone}</Text>
          <View style={styles.menuDivider} />
          <Text style={styles.addressLabel}>Alamat Tujuan:</Text>
          <Text style={styles.addressValue}>{dataPesanan.address}</Text>
          <Text style={styles.notesValue}>*Catatan: {dataPesanan.notes}</Text>
        </View>

        {/* Rincian Pembayaran */}
        <Text style={styles.sectionTitle}>💳 Rincian Pembayaran</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Metode Pembayaran</Text>
            <Text style={styles.infoValueBold}>{dataPesanan.method}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Biaya Layanan</Text>
            <Text style={styles.infoValue}>{dataPesanan.price}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Biaya Aplikasi</Text>
            <Text style={styles.infoValue}>{dataPesanan.appFee}</Text>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.totalLabel}>Total Bayar</Text>
            <Text style={styles.totalValue}>{dataPesanan.total}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnReorder} onPress={() => Alert.alert('Info', 'Fitur re-order menyusul ya bro!')}>
          <Text style={styles.btnReorderText}>🔄 Pesan Lagi Layanan Ini</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 40 },
  statusBanner: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e1e4e8', marginBottom: 15 },
  statusIcon: { fontSize: 32, marginBottom: 6 },
  statusText: { fontSize: 18, fontWeight: 'bold', color: '#2b9348' },
  statusSubtext: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e1e24', marginTop: 15, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e1e4e8', marginBottom: 5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4, alignItems: 'center' },
  infoLabel: { fontSize: 13, color: '#666' },
  infoValue: { fontSize: 13, color: '#333' },
  infoValueBold: { fontSize: 14, fontWeight: 'bold', color: '#1e1e24' },
  menuDivider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  totalLabel: { fontSize: 15, fontWeight: 'bold', color: '#1e1e24' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#e63946' },
  btnReorder: { backgroundColor: '#1e1e24', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 25 },
  btnReorderText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  
  // Styles Tambahan untuk komponen Alamat Lokasi
  addressContactText: { fontSize: 13, color: '#666', marginTop: 2 },
  addressLabel: { fontSize: 12, color: '#999', fontWeight: 'bold', marginTop: 4 },
  addressValue: { fontSize: 13, color: '#333', marginTop: 2, lineHeight: 18 },
  notesValue: { fontSize: 12, color: '#e63946', fontStyle: 'italic', marginTop: 4 }
});