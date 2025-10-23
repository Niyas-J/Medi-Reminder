// Type definitions for Medicine Reminder App

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: MedicineFrequency;
  times: string[]; // Array of time strings (e.g., ["09:00", "21:00"])
  startDate: Date;
  endDate: Date;
  refillDate: Date;
  currentStock: number;
  totalStock: number;
  instructions: string;
  imageUrl?: string;
  color: string;
}

export enum MedicineFrequency {
  ONCE_DAILY = 'once_daily',
  TWICE_DAILY = 'twice_daily',
  THREE_TIMES_DAILY = 'three_times_daily',
  FOUR_TIMES_DAILY = 'four_times_daily',
  CUSTOM = 'custom'
}

export interface MedicineSchedule {
  medicineId: string;
  scheduledTime: Date;
  taken: boolean;
  takenAt?: Date;
  skipped: boolean;
  notes?: string;
}

export interface NotificationConfig {
  id: string;
  medicineId: string;
  medicineName: string;
  scheduledTime: Date;
  notificationId: number;
  enabled: boolean;
}

export interface PharmacyOrder {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  pharmacyId: string;
  pharmacyName: string;
  orderDate: Date;
  deliveryDate?: Date;
  status: OrderStatus;
  totalPrice: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  deliveryAvailable: boolean;
  estimatedDeliveryTime: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface AppState {
  medicines: Medicine[];
  schedules: MedicineSchedule[];
  notifications: NotificationConfig[];
  orders: PharmacyOrder[];
}

