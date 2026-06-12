import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sudah Punya Akun?</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('MainApp')}>
        <Text style={styles.btnText}>Ya, Login Sekarang</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.btnSecondary]} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.btnTextSecondary}>Belum, Register Dulu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f7' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  button: { backgroundColor: '#1e1e24', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#1e1e24' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnTextSecondary: { color: '#1e1e24', fontSize: 16, fontWeight: 'bold' }
});