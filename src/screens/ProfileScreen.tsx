import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
// 📥 TAMBAHKAN IMPORT INI
import { useNavigation } from '@react-navigation/native';

const FAQ_DATA = [
  {
    id: 1,
    question: '❓ Bagaimana cara membatalkan pesanan?',
    answer: 'Lu bisa membatalkan pesanan langsung lewat halaman status order sebelum abang barber-nya berangkat ke lokasi lu, cuy.'
  },
  {
    id: 2,
    question: '💳 Metode pembayaran apa saja yang didukung?',
    answer: 'Saat ini kita mendukung pembayaran tunai (COD) setelah cukur selesai dan juga E-Wallet (GoPay, OVO, Dana).'
  },
  {
    id: 3,
    question: '📍 Apakah bisa pesan untuk area di luar Jabodetabek?',
    answer: 'Untuk sekarang layanan Barber On Call baru beroperasi maksimal di area Bogor, Bekasi, dan Jakarta. Kota lain bakal segera menyusul!'
  }
];

export default function ProfileScreen() {
  const [name, setName] = useState('Raihan Alwi Noer');
  const [phone, setPhone] = useState('081234567890');

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [inputName, setInputName] = useState(name);
  const [inputPhone, setInputPhone] = useState(phone);

  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  // 🚀 PANGGIL HOOK NAVIGASI DI SINI
  const navigation = useNavigation<any>(); 

  const handleSaveProfile = () => {
    if (!inputName.trim() || !inputPhone.trim()) {
      Alert.alert('Gagal', 'Nama dan nomor HP gak boleh kosong, bro!');
      return;
    }
    setName(inputName);
    setPhone(inputPhone);
    Alert.alert('Sukses', 'Profil lu berhasil diperbarui!', [
      { text: 'Mantap', onPress: () => setIsEditModalVisible(false) }
    ]);
  };

  const toggleFaq = (id: number) => {
    if (expandedFaqId === id) {
      setExpandedFaqId(null);
    } else {
      setExpandedFaqId(id);
    }
  };

  // 🚪 FUNGSI LOGOUT YANG SEKARANG UDAH AKTIF BISA PINDAH HALAMAN
  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Lu yakin mau logout dari aplikasi Barber On Call?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Ya, Keluar', 
          style: 'destructive',
          onPress: () => {
            // 🔥 KUNCINYA DI SINI: Reset tumpukan halaman, langsung lempar ke 'Login'
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }], // 👈 Sesuaikan dengan nama route halaman Login di AppNavigator lu
            });
          } 
        }
      ]
    );
  };

  return (
    // ... Sisa kode return ke bawahnya tetep sama persis ...
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* SECTION 1: HEADER & AVATAR KONTEN */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userPhone}>📱 {phone}</Text>
        
        <TouchableOpacity 
          style={styles.btnEditTrigger} 
          onPress={() => {
            setInputName(name);
            setInputPhone(phone);
            setIsEditModalVisible(true);
          }}
        >
          <Text style={styles.btnEditTriggerText}>✏️ Edit Profil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* SECTION 2: PUSAT BANTUAN (HELP CENTER) */}
      <View style={styles.helpSection}>
        <Text style={styles.sectionTitle}>📌 Pusat Bantuan (FAQ)</Text>
        <Text style={styles.sectionSubtitle}>Punya kendala? Cek solusi cepat di bawah ini:</Text>

        {FAQ_DATA.map((faq) => (
          <View key={faq.id} style={styles.faqCard}>
            <TouchableOpacity style={styles.faqHeader} onPress={() => toggleFaq(faq.id)}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqArrow}>
                {expandedFaqId === faq.id ? '🔼' : '🔽'}
              </Text>
            </TouchableOpacity>
            
            {expandedFaqId === faq.id && (
              <View style={styles.faqAnswerContainer}>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}

        <Text style={styles.contactTitle}>Masih butuh bantuan lain?</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.btnContact} onPress={() => Alert.alert('WhatsApp', 'Meluncur ke WA Admin CS (0812-xxxx-xxxx)')}>
            <Text style={styles.btnContactText}>💬 Chat WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnContact, { backgroundColor: '#1e1e24' }]} onPress={() => Alert.alert('Email', 'Mengirim email ke support@barberoncall.com')}>
            <Text style={[styles.btnContactText, { color: '#fff' }]}>✉️ Kirim Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* SECTION 3: TOMBOL LOGOUT UTAMA */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Text style={styles.btnLogoutText}>🚪 Keluar Akun (Logout)</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>BarberOnCall v1.0.0 Pro prototype</Text>
      </View>

      {/* ==================== MODAL POP-UP EDIT PROFIL ==================== */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)} // Biar aman pas user klik tombol back hardware Android
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Ubah Informasi Profil</Text>
            
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput 
              style={styles.input}
              value={inputName}
              onChangeText={setInputName}
              placeholder="Masukkan nama baru lu"
            />

            <Text style={styles.label}>Nomor Kontak</Text>
            <TextInput 
              style={styles.input}
              value={inputPhone}
              onChangeText={(text) => setInputPhone(text.replace(/[^0-9]/g, ''))}
              placeholder="Contoh: 081234567890"
              keyboardType="numeric"
              maxLength={12}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSaveProfile}>
                <Text style={styles.btnSaveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingTop: 60, paddingBottom: 60 },
  
  profileHeader: { alignItems: 'center', paddingHorizontal: 20 },
  // 🔄 Diubah ke properti shadow standar RN biar kompatibel di semua versi cross-platform
  avatarCircle: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#1e1e24', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1e1e24' },
  userPhone: { fontSize: 14, color: '#666', marginTop: 4 },
  btnEditTrigger: { marginTop: 15, paddingVertical: 8, paddingHorizontal: 20, borderWidth: 1, borderColor: '#1e1e24', borderRadius: 20 },
  btnEditTriggerText: { color: '#1e1e24', fontWeight: 'bold', fontSize: 13 },
  
  divider: { height: 8, backgroundColor: '#f5f5f7', marginVertical: 25 },

  helpSection: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1e24', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#666', marginBottom: 15 },
  faqCard: { borderWidth: 1, borderColor: '#eaeaea', borderRadius: 8, marginBottom: 10, backgroundColor: '#fcfcfd', overflow: 'hidden' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1, paddingRight: 10 },
  faqArrow: { fontSize: 12 },
  faqAnswerContainer: { padding: 15, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  faqAnswer: { fontSize: 13, color: '#555', lineHeight: 18 },

  contactTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e1e24', marginTop: 25, marginBottom: 10, textAlign: 'center' },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btnContact: { flex: 1, backgroundColor: '#25d366', padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  btnContactText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  logoutSection: { paddingHorizontal: 20, alignItems: 'center', marginTop: 10 },
  btnLogout: { width: '100%', borderWidth: 1, borderColor: '#e63946', padding: 15, borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' },
  btnLogoutText: { color: '#e63946', fontWeight: 'bold', fontSize: 15 },
  versionText: { fontSize: 11, color: '#aaa', marginTop: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#1e1e24' },
  label: { fontWeight: 'bold', fontSize: 13, color: '#333', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  modalActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, marginBottom: 15 },
  btnCancel: { flex: 1, backgroundColor: '#f0f0f3', padding: 14, borderRadius: 8, alignItems: 'center', marginRight: 10 },
  btnCancelText: { color: '#e63946', fontWeight: 'bold' },
  btnSave: { flex: 1, backgroundColor: '#1e1e24', padding: 14, borderRadius: 8, alignItems: 'center' },
  btnSaveText: { color: '#fff', fontWeight: 'bold' }
});