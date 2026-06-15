import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import CustomHeader from '../components/CustomHeader'; 

type HistoryOrder = {
  orderId: string;
  service: string;
  date: string;
  price: string;
  status: string;
  customerName: string;
  address: string;
  addressNotes?: string;
  contact?: string;
  paymentMethod?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'HistoryDetail'>;

export default function HistoryDetailScreen({ route, navigation }: Props) {
  // 📥 1. AMBIL DATA ASLI DARI DATABASE YANG DIKIRIM VIA NAVIGASI
  const order = route.params?.order as HistoryOrder | undefined;
  const paymentMethod = order?.paymentMethod || 'Tunai / COD';

  // 🛡️ Fallback kalau tiba-tiba datanya kosong pas loading
  if (!order) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'red' }}>Gagal memuat detail pesanan!</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. KITA PAKE DATA 'order' LANGSUNG
  return (
    <View style={styles.container}>
      {/* HEADER MODULAR SAKTI */}
      <CustomHeader title="Detail Riwayat" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Status Dinamis */}
        <View style={styles.statusBanner}>
          <Text style={styles.statusIcon}>
            {order.status === 'Selesai' ? '✅' : '⏳'}
          </Text>
          <Text style={[styles.statusText, order.status !== 'Selesai' && { color: '#f77f00' }]}>
            Pesanan {order.status}
          </Text>
          <Text style={styles.statusSubtext}>
            {order.status === 'Selesai' 
              ? 'Terima kasih sudah memotong rambut bersama kami!' 
              : 'Tukang cukur sedang memproses pesanan lu.'}
          </Text>
        </View>

        {/* Info Utama Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Pesanan</Text>
            {/* Format ID biar ada BOC- nya */}
            <Text style={styles.infoValueBold}>BOC - {order.orderId}</Text> 
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{order.date}</Text>
          </View>
        </View>

        {/* Detail Layanan */}
        <Text style={styles.sectionTitle}>✂️ Detail Layanan</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoValueBold}>{order.service}</Text>
            <Text style={styles.infoValue}>{order.price}</Text>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Barber</Text>
            {/* Karena DB belum ada spesifik tukang cukur, kita fallback dulu */}
            <Text style={styles.infoValue}>Menunggu Konfirmasi</Text>
          </View>
        </View>

        {/* 📍 Lokasi & Penerima Dinamis */}
        <Text style={styles.sectionTitle}>📍 Lokasi & Penerima</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoValueBold}>{order.customerName}</Text>
          {/* Kalau kontak belum dilempar dari HistoryScreen, kasih strip dulu */}
          <Text style={styles.addressContactText}>📱 {order.contact || '-'}</Text>
          <View style={styles.menuDivider} />
          <Text style={styles.addressLabel}>Alamat Tujuan:</Text>
          <Text style={styles.addressValue}>{order.address}</Text>
          <Text style={styles.notesValue}>*Catatan: {order.addressNotes || '-'}</Text>
        </View>

        {/* Rincian Pembayaran */}
        <Text style={styles.sectionTitle}>💳 Rincian Pembayaran</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Metode Pembayaran</Text>
            {/* Fallback metode, karena kita blm simpen ini di DB PostgreSQL */}
            <Text style={styles.infoValueBold}>{paymentMethod}</Text>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.totalLabel}>Total Bayar</Text>
            <Text style={styles.totalValue}>{order.price}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnReorder} onPress={() => Alert.alert('Info', 'Fitur re-order menyusul ya bro!')}>
          <Text style={styles.btnReorderText}>🔄 Pesan Lagi Layanan Ini</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Styles persis sama kayak yang lu punya, gak diubah sedikitpun
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
  addressContactText: { fontSize: 13, color: '#666', marginTop: 2 },
  addressLabel: { fontSize: 12, color: '#999', fontWeight: 'bold', marginTop: 4 },
  addressValue: { fontSize: 13, color: '#333', marginTop: 2, lineHeight: 18 },
  notesValue: { fontSize: 12, color: '#e63946', fontStyle: 'italic', marginTop: 4 }
});