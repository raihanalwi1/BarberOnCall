import React, { useState } from 'react'; 
import { useAuth } from '../navigation/AuthContext';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert      
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth(); 

  const [phoneInput, setPhoneInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'http://192.168.2.4:3000/api/login';

  const handleLogin = async () => {
    if (!phoneInput.trim()) {
      Alert.alert('Eitss', 'Nomor HP jangan dikosongin dong, bro!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomor_hp: phoneInput }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Sukses Login', `Selamat datang kembali, ${result.user.nama}!`, [
          { 
            text: 'Gas Cukur', 
            onPress: () => login(result.user.id.toString()) 
          }
        ]);
      } else {
        Alert.alert('Gagal Masuk', result.message || 'Nomor HP salah atau belum terdaftar.');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal konek ke server. Pastikan server Node.js lu udah nyala, cuy!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barber On Call 💈</Text>
      <Text style={styles.subtitle}>Sudah Punya Akun?</Text>
      
      <Text style={styles.label}>Nomor Kontak</Text>
      <TextInput 
        style={styles.input}
        value={phoneInput}
        onChangeText={(text) => setPhoneInput(text.replace(/[^0-9]/g, ''))} 
        placeholder="Masukkan nomor HP lu (Contoh: 0812...)"
        keyboardType="numeric"
        maxLength={13}
      />
  
      <TouchableOpacity 
        style={[styles.button, isLoading && { opacity: 0.6 }]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.btnText}>
          {isLoading ? 'Memverifikasi...' : 'Ya, Login Sekarang'}
        </Text>
      </TouchableOpacity>

      <Text style={{ color: '#666' }}>Belum punya akun? </Text>
  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
    <Text style={{ color: '#1e1e24', fontWeight: 'bold' }}>Daftar di sini, bro.</Text>
  </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#f5f5f7' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1e1e24', marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 40 },
  label: { fontWeight: 'bold', fontSize: 14, color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, backgroundColor: '#fff', marginBottom: 25 },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15, backgroundColor: '#1e1e24' },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#1e1e24' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnTextSecondary: { color: '#1e1e24', fontSize: 16, fontWeight: 'bold' }
});