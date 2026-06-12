import { create } from 'zustand';
import { OrderData, ServiceType, PaymentMethod } from '../types';

interface OrderState {
  currentOrder: OrderData & { addressNotes?: string }; // Tambahkan opsional di sini
  setServiceType: (type: ServiceType) => void;
  setLocation: (latitude: number, longitude: number) => void;
  setCustomerDetails: (name: string, contact: string, addressNotes: string) => void; // Update ini
  setPaymentDetails: (method: PaymentMethod) => void;
  resetOrder: () => void;
}

const initialOrder = {
  serviceType: 'REGULER' as ServiceType,
  customerName: '',
  contact: '',
  addressNotes: '', // Tambahkan default kosong
  latitude: -6.2088,
  longitude: 106.8456,
  serviceFee: 50000,
  totalFee: 50000,
  paymentMethod: 'COD' as PaymentMethod,
};

export const useOrderStore = create<OrderState>((set) => ({
  currentOrder: initialOrder,
  setServiceType: (type) => set((state) => {
    const fee = type === 'BISNIS' ? 120000 : 50000;
    return { currentOrder: { ...state.currentOrder, serviceType: type, serviceFee: fee, totalFee: fee } };
  }),
  setLocation: (latitude, longitude) => set((state) => ({
    currentOrder: { ...state.currentOrder, latitude, longitude }
  })),
  // Update fungsi ini untuk menangkap data catatan alamat
  setCustomerDetails: (name, contact, addressNotes) => set((state) => ({
    currentOrder: { ...state.currentOrder, customerName: name, contact, addressNotes }
  })),
  setPaymentDetails: (method) => set((state) => ({
    currentOrder: { ...state.currentOrder, paymentMethod: method }
  })),
  resetOrder: () => set({ currentOrder: initialOrder }),
}));