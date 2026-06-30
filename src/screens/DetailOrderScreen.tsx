import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal, 
  FlatList, 
  ActivityIndicator,
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useOrderStore } from '../store/useOrderStore';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { AuthContext } from '../navigation/AuthContext';
import appJson from '../../app.json';

type Props = NativeStackScreenProps<RootStackParamList, 'DetailOrder'>;

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function DetailOrderScreen({ navigation }: Props) {
  const { userId } = useContext(AuthContext); 
  const { currentOrder, setCustomerDetails, setPaymentDetails, setLocation } = useOrderStore();
  
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [fullAddress, setFullAddress] = useState(''); 
  const [addressNotes, setAddressNotes] = useState('');
  const [serviceName, setServiceName] = useState(currentOrder.serviceType); // Default-nya nampilin ID dulu sblm data ke-load

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // 🛠️ FIX 1: PISAHIN STATE LOADING BIAR GAK BENTROK
  const [isFetchingGPS, setIsFetchingGPS] = useState(false); 
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'BarberOnCallApp-v1.1', 'Accept': 'application/json' } } 
      );
      
      const text = await response.text();
      if (text.trim().startsWith('{')) {
        const data = JSON.parse(text);
        if (data && data.display_name) {
          setFullAddress(data.display_name);
        }
      }
    } catch (error) {
      console.error('Gagal mengambil nama jalan dari GPS:', error);
    }
  };

  useEffect(() => {
    if (currentOrder.latitude && currentOrder.longitude && fullAddress === '') {
      fetchAddressFromCoords(currentOrder.latitude, currentOrder.longitude);
    }
  }, []);
  useEffect(() => {
  const fetchServiceName = async () => {
    try {
      const response = await fetch('http://192.168.2.4:3000/api/services');
      const result = await response.json();
      
      if (result.success) {
        // Cocokin ID dari store sama data dari database
        const matchedService = result.data.find(
          (s: any) => s.id.toString() === currentOrder.serviceType.toString()
        );
        
        if (matchedService) {
          setServiceName(matchedService.name); // Timpa ID dengan nama aslinya
        }
      }
    } catch (error) {
      console.error('Gagal mengambil detail nama layanan:', error);
    }
  };

  fetchServiceName();
}, [currentOrder.serviceType]);

  const handleResetToRealGPS = async () => {
    setIsFetchingGPS(true); // Pake state khusus GPS
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Akses Ditolak', 'Izinkan aplikasi ngakses lokasi lu dulu di pengaturan HP.');
        setIsFetchingGPS(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      
      setLocation(lat, lng);
      fetchAddressFromCoords(lat, lng);
      
      const jsCode = `
        if (typeof map !== 'undefined') {
          map.setView([${lat}, ${lng}], 16);
        }
      `;
      webViewRef.current?.injectJavaScript(jsCode);
      
      setIsModalVisible(false);

    } catch (error) {
      Alert.alert('GPS Tidak Aktif', 'Nyalain dulu GPS HP lu cuy, terus pencet tombol ini lagi.');
    } finally {
      setIsFetchingGPS(false); // Matiin loading GPS
    }
  };

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.lat && data.lng) {
        setLocation(data.lat, data.lng);
      }
    } catch (e) {
      console.log('Error parsing map message:', e);
    }
  };

  const handleSearchAddress = async () => {
    const query = searchQuery.trim();
    
    if (!query) {
      Alert.alert('Peringatan', 'Ketik alamatnya dulu bro!');
      return;
    }

    if (query.length < 3) {
      Alert.alert('Peringatan', 'Ketik minimal 3 huruf buat nyari alamat (contoh: Ban...)!');
      return;
    }

    setIsSearchingAddress(true); // Pake state khusus Pencarian Alamat
    setHasSearched(false);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=5`,
        { 
          headers: { 
            'User-Agent': `BarberApp_${Math.random().toString(36).substring(7)}`, 
            'Accept': 'application/json' 
          } 
        }
      );
      
      const text = await response.text();
      
      if (text.trim().startsWith('[')) {
        const data = JSON.parse(text);
        
        if (data.length === 0) {
          // Gak usah pake alert lagi, biar UI Empty State yang jalan
          setSearchResults([]);
        } else {
          setSearchResults(data);
        }
        setHasSearched(true);
      } else {
        console.warn('Kena Limit Server Nominatim:', text);
        Alert.alert(
          'Server Peta Sibuk 🚦', 
          'Pencarian alamat lagi kena limit dari server pusat. Coba geser-geser petanya secara manual aja dulu ya cuy!'
        );
      }
    } catch (error) {
      console.error('Error nyari alamat:', error);
      Alert.alert('Koneksi Error', 'Gagal mencari alamat. Pastikan kuota dan sinyal lu aman.');
    } finally {
      setIsSearchingAddress(false); // Matiin loading Pencarian Alamat
    }
  };

  const handleSelectAddress = (lat: string, lon: string, displayName: string) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    setLocation(latitude, longitude);
    setFullAddress(displayName); 
    setIsModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);

    const jsCode = `
      if (typeof map !== 'undefined') {
        map.setView([${latitude}, ${longitude}], 16);
      }
    `;
    webViewRef.current?.injectJavaScript(jsCode);
  };

  const handleNext = async () => {
    if (!name || !contact || !fullAddress) {
      Alert.alert('Gagal', 'Mohon isi nama, kontak, dan alamat lengkap dahulu!');
      return;
    }

    if (contact.length !== 12) {
      Alert.alert('Input Salah', 'Nomor kontak harus tepat 12 angka!');
      return;
    }

    setCustomerDetails(name, contact, addressNotes);
    setIsSubmitting(true);

    try {
      const response = await fetch('http://192.168.2.4:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || 1, 
          layanan: currentOrder.serviceType,
          harga: currentOrder.totalFee,
          alamat: fullAddress, 
          catatanAlamat: addressNotes || '-',
          namaPenerima: name, 
          kontakPenerima: contact 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        navigation.navigate('Result', { orderId: `BOC-${result.orderId}` });
      } else {
        Alert.alert('Gagal Kirim', result.error || 'Terjadi kesalahan pada server');
      }
    } catch (error) {
      console.error('Error post order:', error);
      Alert.alert('Koneksi Error', 'Gagal terhubung ke server backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.headerActionBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>Detail Pesanan</Text>
        
        <TouchableOpacity style={styles.headerActionBtn} onPress={() => setIsMenuVisible(true)}>
          <Text style={styles.tripleDotText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subHeaderTitle}>Konfirmasi Layanan: {serviceName}</Text>
        
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            onMessage={handleMapMessage}
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
                  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
                  <style>
                    html, body, #map { height: 100%; margin: 0; padding: 0; overflow: hidden; }
                    .center-marker {
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      margin-top: -36px;
                      margin-left: -18px;
                      z-index: 9999;
                      pointer-events: none;
                    }
                    .pin {
                      width: 36px;
                      height: 36px;
                      border-radius: 50% 50% 50% 0;
                      background: #e63946;
                      transform: rotate(-45deg);
                      box-shadow: -2px 2px 4px rgba(0,0,0,0.3);
                    }
                    .pin::after {
                      content: '';
                      width: 14px;
                      height: 14px;
                      margin: 11px 0 0 11px;
                      background: #1e1e24;
                      position: absolute;
                      border-radius: 50%;
                    }
                  </style>
                </head>
                <body>
                  <div class="center-marker">
                    <div class="pin"></div>
                  </div>
                  <div id="map"></div>
                  <script>
                    var map = L.map('map', { zoomControl: false }).setView([${currentOrder.latitude}, ${currentOrder.longitude}], 16);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                    map.on('moveend', function() {
                      var center = map.getCenter();
                      window.ReactNativeWebView.postMessage(JSON.stringify({ lat: center.lat, lng: center.lng }));
                    });
                  </script>
                </body>
                </html>
              `
            }}
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.actionMapContainer}>
          <TouchableOpacity style={styles.btnSearchLocation} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.btnSearchLocationText}>🔍 Cari & Ketik Alamat Tujuan</Text>
          </TouchableOpacity>
          <Text style={styles.hintText}>📍 Geser petanya saja, peniti merah akan selalu mengunci titik tengah rumah lu.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nama Pemesan / Penerima</Text>
          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            placeholder="Masukkan nama Lengkap" 
          />

          <Text style={styles.label}>Nomor Kontak (Harus 12 Angka)</Text>
          <TextInput 
            style={styles.input} 
            value={contact} 
            onChangeText={(text) => setContact(text.replace(/[^0-9]/g, ''))}
            placeholder="Contoh: 081234567890" 
            keyboardType="numeric"
            maxLength={12}
          />

          <Text style={styles.label}>Alamat Lengkap</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={fullAddress} 
            onChangeText={setFullAddress} 
            placeholder="Mencari alamat GPS..." 
            multiline={true}
            numberOfLines={3}
          />

          <Text style={styles.label}>Catatan Alamat (Patokan Rumah)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={addressNotes} 
            onChangeText={setAddressNotes} 
            placeholder="Contoh: Rumah warna hijau, depan warung, pagar hitam" 
            multiline={true}
            numberOfLines={3}
          />

          <Text style={styles.label}>Metode Pembayaran</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.radio, currentOrder.paymentMethod === 'COD' && styles.radioActive]} 
              onPress={() => setPaymentDetails('COD')}
            >
              <Text style={[styles.radioText, currentOrder.paymentMethod === 'COD' ? styles.textActive : styles.textInActive]}>
                COD (Tunai)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.radio, currentOrder.paymentMethod === 'EWALLET' && styles.radioActive]} 
              onPress={() => setPaymentDetails('EWALLET')}
            >
              <Text style={[styles.radioText, currentOrder.paymentMethod === 'EWALLET' ? styles.textActive : styles.textInActive]}>
                E-Wallet
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryContainer}>
            <Text>Biaya Layanan: Rp {currentOrder.serviceFee.toLocaleString()}</Text>
            <Text style={styles.total}>Total Biaya: Rp {currentOrder.totalFee.toLocaleString()}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.btnNext, isSubmitting && { opacity: 0.6 }]} 
            onPress={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnNextText}>Konfirmasi & Pesan (Next)</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* DROPDOWN MODAL TITIK 3 */}
      <Modal animationType="fade" transparent={true} visible={isMenuVisible}>
        <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <View style={styles.dropdownBox}>
              <Text style={styles.menuTitle}>ℹ️ Info Aplikasi</Text>
              <View style={styles.menuDivider} />
              <Text style={styles.versionText}>Versi: v{appJson.expo.version}</Text>
              <Text style={styles.buildText}>Build: 2026.06.13</Text>
              
              <TouchableOpacity style={styles.btnCloseMenu} onPress={() => setIsMenuVisible(false)}>
                <Text style={styles.btnCloseMenuText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* POP-UP MODAL PENCARIAN ALAMAT */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cari Alamat Tujuan</Text>
            
            <TouchableOpacity 
              style={[styles.btnResetGPS, isFetchingGPS && { opacity: 0.6 }, { marginBottom: 15 }]} 
              onPress={handleResetToRealGPS}
              disabled={isFetchingGPS}
            >
              {isFetchingGPS ? (
                <ActivityIndicator color="#1e1e24" size="small" />
              ) : (
                <Text style={styles.btnResetGPSText}>🎯 Gunakan Lokasi GPS Saat Ini</Text>
              )}
            </TouchableOpacity>

            <View style={styles.searchBarRow}>
              <TextInput 
                style={styles.searchInput}
                placeholder="Ketik alamat (Contoh: Harapan Indah)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.btnGoSearch} onPress={handleSearchAddress}>
                <Text style={styles.btnGoSearchText}>Cari</Text>
              </TouchableOpacity>
            </View>

            {/* 🛠️ FIX 2: Hapus duplikat loading dari sini, cuma sisain yang di dalem ternary */}
            
            {isSearchingAddress ? (
              <ActivityIndicator size="large" color="#1e1e24" style={{ marginVertical: 30 }} />
            ) : (
              hasSearched && searchResults.length === 0 ? (
                <View style={styles.emptySearchContainer}>
                  <Text style={styles.emptySearchEmoji}>🔍</Text>
                  <Text style={styles.emptySearchTitle}>Alamat nggak ketemu nih, cuy!</Text>
                  <Text style={styles.emptySearchSub}>
                    Coba ketik nama jalan yang lebih spesifik, atau tutup menu ini dan langsung geser-geser petanya aja secara manual.
                  </Text>
                </View>
              ) : (
                <FlatList 
                  data={searchResults}
                  keyExtractor={(item) => item.place_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectAddress(item.lat, item.lon, item.display_name)}>
                      <Text style={styles.resultItemText} numberOfLines={2}>{item.display_name}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.resultList}
                />
              )
            )}

            <TouchableOpacity style={styles.btnCancelModal} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.btnCancelModalText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  headerActionBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backArrowText: { fontSize: 24, fontWeight: 'bold', color: '#1e1e24' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e1e24', textAlign: 'center', flex: 1 },
  tripleDotText: { fontSize: 24, fontWeight: 'bold', color: '#1e1e24' },
  scrollContent: { paddingTop: 10, paddingBottom: 40 },
  subHeaderTitle: { fontSize: 14, fontWeight: '500', textAlign: 'center', color: '#666', marginBottom: 15 },
  mapContainer: { height: 240, width: '100%', backgroundColor: '#eee', position: 'relative' },
  actionMapContainer: { paddingHorizontal: 20, marginTop: 12 },
  btnSearchLocation: { backgroundColor: '#1e1e24', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSearchLocationText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  btnResetGPS: { backgroundColor: '#fff', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#1e1e24', justifyContent: 'center' },
  btnResetGPSText: { color: '#1e1e24', fontWeight: 'bold', fontSize: 14 },
  
  hintText: { fontSize: 11, color: '#e63946', marginTop: 6, fontStyle: 'italic', textAlign: 'center', fontWeight: '500' },
  form: { padding: 20 },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#fff' },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  radio: { flex: 1, paddingVertical: 12, paddingHorizontal: 4, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', marginRight: 5 },
  radioActive: { backgroundColor: '#1e1e24', borderColor: '#1e1e24' },
  radioText: { fontSize: 14, textAlign: 'center' },
  textActive: { color: '#fff', fontWeight: 'bold' },
  textInActive: { color: '#000', fontWeight: 'normal' },
  summaryContainer: { marginTop: 25, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8 },
  total: { fontWeight: 'bold', fontSize: 16, marginTop: 5, color: '#e63946' },
  btnNext: { backgroundColor: '#1e1e24', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 25 },
  btnNextText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  dropdownBox: { 
    backgroundColor: '#fff', 
    width: 180, 
    marginTop: Platform.OS === 'ios' ? 105 : 85, 
    marginRight: 15, 
    borderRadius: 8, 
    padding: 15,
    elevation: 5 
  },
  menuTitle: { fontSize: 13, fontWeight: 'bold', color: '#666' },
  menuDivider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  versionText: { fontSize: 14, color: '#1e1e24', fontWeight: '500' },
  buildText: { fontSize: 11, color: '#999', marginTop: 2 },
  btnCloseMenu: { marginTop: 12, backgroundColor: '#f0f0f3', paddingVertical: 6, borderRadius: 4, alignItems: 'center' },
  btnCloseMenuText: { color: '#333', fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1e1e24' },
  searchBarRow: { flexDirection: 'row', marginBottom: 15 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 10, fontSize: 15 },
  btnGoSearch: { backgroundColor: '#007aff', paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center' },
  btnGoSearchText: { color: '#fff', fontWeight: 'bold' },
  resultList: { marginVertical: 10 },
  resultItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  resultItemText: { fontSize: 14, color: '#333' },
  emptySearchContainer: { alignItems: 'center', paddingVertical: 40 },
  emptySearchEmoji: { fontSize: 48, marginBottom: 15 },
  emptySearchTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e1e24', marginBottom: 10 },
  emptySearchSub: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },
  btnCancelModal: { backgroundColor: '#f0f0f3', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnCancelModalText: { color: '#e63946', fontWeight: 'bold', fontSize: 15 }
});