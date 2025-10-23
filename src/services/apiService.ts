import axios, { AxiosInstance } from 'axios';
import { Medicine, PharmacyOrder, Pharmacy, OrderStatus } from '../types';

// API Base URL - Replace with your actual backend URL
const API_BASE_URL = 'https://api.yourhealthcareapp.com/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    this.api.interceptors.request.use(
      async (config) => {
        // Add auth token from storage
        // const token = await AsyncStorage.getItem('authToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // ==================== Medicine APIs ====================

  /**
   * Get all medicines for current user
   */
  getMedicines = async (): Promise<Medicine[]> => {
    try {
      const response = await this.api.get('/medicines');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
      throw error;
    }
  };

  /**
   * Add a new medicine
   */
  addMedicine = async (medicine: Omit<Medicine, 'id'>): Promise<Medicine> => {
    try {
      const response = await this.api.post('/medicines', medicine);
      return response.data;
    } catch (error) {
      console.error('Failed to add medicine:', error);
      throw error;
    }
  };

  /**
   * Update an existing medicine
   */
  updateMedicine = async (id: string, medicine: Partial<Medicine>): Promise<Medicine> => {
    try {
      const response = await this.api.put(`/medicines/${id}`, medicine);
      return response.data;
    } catch (error) {
      console.error('Failed to update medicine:', error);
      throw error;
    }
  };

  /**
   * Delete a medicine
   */
  deleteMedicine = async (id: string): Promise<void> => {
    try {
      await this.api.delete(`/medicines/${id}`);
    } catch (error) {
      console.error('Failed to delete medicine:', error);
      throw error;
    }
  };

  /**
   * Update medicine stock
   */
  updateMedicineStock = async (id: string, currentStock: number): Promise<Medicine> => {
    try {
      const response = await this.api.patch(`/medicines/${id}/stock`, { currentStock });
      return response.data;
    } catch (error) {
      console.error('Failed to update stock:', error);
      throw error;
    }
  };

  // ==================== Pharmacy APIs ====================

  /**
   * Get nearby pharmacies
   */
  getNearbyPharmacies = async (latitude: number, longitude: number): Promise<Pharmacy[]> => {
    try {
      const response = await this.api.get('/pharmacies/nearby', {
        params: { latitude, longitude },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error);
      throw error;
    }
  };

  /**
   * Search for pharmacies
   */
  searchPharmacies = async (query: string): Promise<Pharmacy[]> => {
    try {
      const response = await this.api.get('/pharmacies/search', {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search pharmacies:', error);
      throw error;
    }
  };

  /**
   * Check medicine availability at pharmacy
   */
  checkMedicineAvailability = async (
    pharmacyId: string,
    medicineName: string
  ): Promise<{ available: boolean; price: number; estimatedDelivery: string }> => {
    try {
      const response = await this.api.get(`/pharmacies/${pharmacyId}/availability`, {
        params: { medicine: medicineName },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check availability:', error);
      throw error;
    }
  };

  // ==================== Order APIs ====================

  /**
   * Create a new pharmacy order
   */
  createOrder = async (orderData: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    pharmacyId: string;
  }): Promise<PharmacyOrder> => {
    try {
      const response = await this.api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  };

  /**
   * Get all orders for current user
   */
  getOrders = async (): Promise<PharmacyOrder[]> => {
    try {
      const response = await this.api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  };

  /**
   * Get order details
   */
  getOrderDetails = async (orderId: string): Promise<PharmacyOrder> => {
    try {
      const response = await this.api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      throw error;
    }
  };

  /**
   * Cancel an order
   */
  cancelOrder = async (orderId: string): Promise<void> => {
    try {
      await this.api.post(`/orders/${orderId}/cancel`);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  };

  /**
   * Track order status
   */
  trackOrder = async (orderId: string): Promise<{
    status: OrderStatus;
    estimatedDelivery: string;
    currentLocation?: string;
  }> => {
    try {
      const response = await this.api.get(`/orders/${orderId}/track`);
      return response.data;
    } catch (error) {
      console.error('Failed to track order:', error);
      throw error;
    }
  };

  // ==================== Schedule APIs ====================

  /**
   * Record medication intake
   */
  recordIntake = async (medicineId: string, scheduledTime: Date, taken: boolean): Promise<void> => {
    try {
      await this.api.post('/schedules/intake', {
        medicineId,
        scheduledTime,
        taken,
        takenAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to record intake:', error);
      throw error;
    }
  };

  /**
   * Get schedule history
   */
  getScheduleHistory = async (
    medicineId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> => {
    try {
      const response = await this.api.get('/schedules/history', {
        params: { medicineId, startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch schedule history:', error);
      throw error;
    }
  };
}

export default new ApiService();

