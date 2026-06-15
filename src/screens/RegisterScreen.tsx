import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from 'react-native';

// 📥 Import useAuth dari file context terpisah (Biar gak require cycle)
import { useAuth } from '../navigation/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const { login } = useAuth();

  // State Form Register
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  // State Alur Kontrol Form
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Input Data, Step 2: Input OTP
  const [isLoading, setIsLoading] = useState(false);

  // 🌐 UBAH IP INI: Sesuaikan sama IP WiFi Laptop/PC tempat backend lu jalan!
  const BASE_URL = 'http://192.168.2.4:3000/api/auth'; 

  // 📲 FUNGSI REKUES KIRIM OTP (Step 1)
  const handleRequestOtp = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Gagal', 'Nama dan Nomor HP wajib diisi, bro!');
      return;
    }
    if (phone.length < 10) {
      Alert.alert('Gagal', 'Nomor HP kekecilan atau gak valid, cuy.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomor_hp: phone }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', 'Kode OTP udah dikirim! Cek DB lu sekarang 🕵️‍♂️');
        setStep(2); // 🚀 Pindah ke form input OTP
      } else {
        Alert.alert('Waduh', result.message || 'Gagal mengirim OTP.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal konek ke server backend. Cek IP WiFi lu!');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔑 FUNGSI VERIFIKASI OTP & DAFTAR (Step 2)
  const handleVerifyAndRegister = async () => {
    if (!otp.trim() || otp.length < 4) {
      Alert.alert('Gagal', 'Masukkan kode OTP yang bener, bro!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/verify-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: name,
          nomor_hp: phone,
          otp_code: otp
        }),
      });

      const result = await response.json();

      if (response.ok && result.userId) {
        Alert.alert('Selamat!', 'Akun lu berhasil dibuat!', [
          {
            text: 'Gas Masuk Aplikasi',
            onPress: () => login(result.userId) // 🔥 Auto-login langsung tembus gembok AppNavigator
          }
        ]);
      } else {
        Alert.alert('Gagal', result.message || 'Kode OTP salah atau udah kedaluwarsa.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Proses verifikasi gagal. Cek terminal backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.headerArea}>
          <Text style={styles.appTitle}>💈 Barber On Call</Text>
          <Text style={styles.appSubtitle}>
            {step === 1 ? 'Daftar akun baru pake nomor HP lu' : 'Verifikasi nomor handphone lu'}
          </Text>
        </View>

        {/* STEP 1: NAMA & HP */}
        {step === 1 && (
          <View style={styles.cardForm}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Budi Gunawan"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Nomor Handphone</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 08123456789"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              maxLength={13}
            />

            <TouchableOpacity 
              style={styles.btnPrimary} 
              onPress={handleRequestOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Kirim Kode OTP 📩</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: INPUT OTP */}
        {step === 2 && (
          <View style={styles.cardForm}>
            <Text style={styles.otpNotice}>
              Kode OTP dikirim ke nomor <Text style={{ fontWeight: 'bold' }}>{phone}</Text>. 
            </Text>

            <Text style={styles.label}>Kode OTP</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="XXXX"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              maxLength={6}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
            />

            <TouchableOpacity 
              style={styles.btnPrimary} 
              onPress={handleVerifyAndRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Verifikasi & Daftar 🚀</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnBack} 
              onPress={() => setStep(1)}
              disabled={isLoading}
            >
              <Text style={styles.btnBackText}>⬅️ Ubah Nomor HP / Nama</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* FOOTER LINK KE LOGIN */}
        <View style={styles.footerArea}>
          <Text style={styles.footerText}>Udah punya akun?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}> Login di sini</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingTop: 80, paddingHorizontal: 24, paddingBottom: 40 },
  headerArea: { alignItems: 'center', marginBottom: 40 },
  appTitle: { fontSize: 28, fontWeight: 'bold', color: '#1e1e24' },
  appSubtitle: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  cardForm: { backgroundColor: '#fff' },
  label: { fontWeight: 'bold', fontSize: 13, color: '#333', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, fontSize: 16, backgroundColor: '#fff', color: '#333' },
  otpNotice: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  otpInput: { textAlign: 'center', fontSize: 24, fontWeight: 'bold', letterSpacing: 8 },
  btnPrimary: { backgroundColor: '#1e1e24', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnBack: { padding: 15, alignItems: 'center', marginTop: 15 },
  btnBackText: { color: '#666', fontWeight: '600', fontSize: 14 },
  footerArea: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, alignItems: 'center' },
  footerText: { color: '#666', fontSize: 14 },
  loginLink: { color: '#1e1e24', fontWeight: 'bold', fontSize: 14 }
});