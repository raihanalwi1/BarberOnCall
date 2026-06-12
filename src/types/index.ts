export type ServiceType = 'REGULER' | 'BISNIS';
export type PaymentMethod = 'COD' | 'EWALLET';

export interface OrderData {
  serviceType: ServiceType;
  customerName: string;
  contact: string;
  latitude: number;
  longitude: number;
  serviceFee: number;
  totalFee: number;
  paymentMethod: PaymentMethod;
}