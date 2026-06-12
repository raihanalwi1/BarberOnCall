import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Platform, 
  TouchableWithoutFeedback 
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // 👑 Biar gak usah lempar prop navigation manual

interface CustomHeaderProps {
  title: string;
}

export default function CustomHeader({ title }: CustomHeaderProps) {
  const navigation = useNavigation();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  return (
    <View style={styles.customHeader}>
      {/* Tombol Back Otomatis Mundur */}
      <TouchableOpacity style={styles.headerActionBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrowText}>←</Text>
      </TouchableOpacity>
      
      {/* Judul Dinamis Tergantung Screen */}
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      
      {/* Tombol Titik Tiga */}
      <TouchableOpacity style={styles.headerActionBtn} onPress={() => setIsMenuVisible(true)}>
        <Text style={styles.tripleDotText}>⋮</Text>
      </TouchableOpacity>

      {/* DROPDOWN MODAL (Disatukan di sini biar ringkas) */}
      <Modal animationType="fade" transparent={true} visible={isMenuVisible}>
        <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View style={styles.dropdownBox}>
              <Text style={styles.menuTitle}>ℹ️ Info Aplikasi</Text>
              <View style={styles.menuDivider} />
              <Text style={styles.versionText}>Versi: v1.0.0-Beta</Text>
              <Text style={styles.buildText}>Build: 2026.06.13</Text>
              
              <TouchableOpacity style={styles.btnCloseMenu} onPress={() => setIsMenuVisible(false)}>
                <Text style={styles.btnCloseMenuText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  customHeader: { 
    flexDirection: 'row', 
    height: 60, 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 15 : 0,
    marginTop: Platform.OS === 'ios' ? 35 : 25
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowText: { fontSize: 24, fontWeight: 'bold', color: '#1e1e24' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1e24', textAlign: 'center', flex: 1 },
  tripleDotText: { fontSize: 24, fontWeight: 'bold', color: '#1e1e24' },

  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  dropdownBox: { 
    backgroundColor: '#fff', 
    width: 180, 
    marginTop: Platform.OS === 'ios' ? 105 : 85, 
    marginRight: 15, 
    borderRadius: 8, 
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuTitle: { fontSize: 13, fontWeight: 'bold', color: '#666' },
  menuDivider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  versionText: { fontSize: 14, color: '#1e1e24', fontWeight: '500' },
  buildText: { fontSize: 11, color: '#999', marginTop: 2 },
  btnCloseMenu: { marginTop: 12, backgroundColor: '#f0f0f3', paddingVertical: 6, borderRadius: 4, alignItems: 'center' },
  btnCloseMenuText: { color: '#333', fontSize: 12, fontWeight: '600' }
});