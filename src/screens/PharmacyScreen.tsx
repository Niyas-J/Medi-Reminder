import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, Pharmacy, PharmacyOrder, OrderStatus } from '../types';
import { colors } from '../theme/colors';
import { commonStyles, spacing } from '../theme/styles';
import apiService from '../services/apiService';

interface PharmacyScreenProps {
  navigation: any;
}

const PharmacyScreen: React.FC<PharmacyScreenProps> = ({ navigation }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([]);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([
    {
      id: '1',
      name: 'HealthPlus Pharmacy',
      address: '123 Main St, City',
      phone: '+1 234-567-8900',
      rating: 4.5,
      deliveryAvailable: true,
      estimatedDeliveryTime: '30-45 mins',
    },
    {
      id: '2',
      name: 'MediCare Express',
      address: '456 Oak Ave, City',
      phone: '+1 234-567-8901',
      rating: 4.8,
      deliveryAvailable: true,
      estimatedDeliveryTime: '45-60 mins',
    },
    {
      id: '3',
      name: 'QuickMeds Delivery',
      address: '789 Pine Rd, City',
      phone: '+1 234-567-8902',
      rating: 4.3,
      deliveryAvailable: true,
      estimatedDeliveryTime: '60-90 mins',
    },
  ]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('30');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedMedicines = await AsyncStorage.getItem('medicines');
      if (storedMedicines) {
        const allMedicines = JSON.parse(storedMedicines);
        setMedicines(allMedicines);

        // Filter low stock medicines (30% or less)
        const lowStock = allMedicines.filter(
          (m: Medicine) => (m.currentStock / m.totalStock) * 100 <= 30
        );
        setLowStockMedicines(lowStock);
      }

      const storedOrders = await AsyncStorage.getItem('orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }

      // Fetch from API
      // const apiOrders = await apiService.getOrders();
      // setOrders(apiOrders);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleOrderMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setOrderQuantity(medicine.totalStock.toString());
    setShowOrderModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedMedicine || !selectedPharmacy) {
      Alert.alert('Error', 'Please select a pharmacy');
      return;
    }

    const newOrder: PharmacyOrder = {
      id: Date.now().toString(),
      medicineId: selectedMedicine.id,
      medicineName: selectedMedicine.name,
      quantity: parseInt(orderQuantity),
      pharmacyId: selectedPharmacy.id,
      pharmacyName: selectedPharmacy.name,
      orderDate: new Date(),
      status: OrderStatus.PENDING,
      totalPrice: parseInt(orderQuantity) * 2.5, // Mock price
    };

    try {
      // Save locally
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Call API
      // await apiService.createOrder({
      //   medicineId: selectedMedicine.id,
      //   medicineName: selectedMedicine.name,
      //   quantity: parseInt(orderQuantity),
      //   pharmacyId: selectedPharmacy.id,
      // });

      setShowOrderModal(false);
      setSelectedMedicine(null);
      setSelectedPharmacy(null);

      Alert.alert(
        'Order Placed! 🎉',
        `Your order for ${selectedMedicine.name} has been placed. Expected delivery: ${selectedPharmacy.estimatedDeliveryTime}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to place order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return colors.warning;
      case OrderStatus.CONFIRMED:
      case OrderStatus.PROCESSING:
        return colors.info;
      case OrderStatus.OUT_FOR_DELIVERY:
        return colors.primary;
      case OrderStatus.DELIVERED:
        return colors.success;
      case OrderStatus.CANCELLED:
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const formatOrderStatus = (status: OrderStatus) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderLowStockItem = ({ item }: { item: Medicine }) => {
    const stockPercentage = (item.currentStock / item.totalStock) * 100;

    return (
      <View style={[styles.card, { borderLeftColor: item.color }]}>
        <View style={styles.cardContent}>
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{item.name}</Text>
            <Text style={styles.dosage}>{item.dosage}</Text>
            <View style={styles.stockInfo}>
              <Text style={styles.stockText}>
                Stock: {item.currentStock}/{item.totalStock}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${stockPercentage}%`,
                      backgroundColor: colors.error,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => handleOrderMedicine(item)}
          >
            <Text style={styles.orderButtonText}>📦 Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: PharmacyOrder }) => {
    const statusColor = getOrderStatusColor(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderMedicineName}>{item.medicineName}</Text>
            <Text style={styles.orderPharmacy}>📍 {item.pharmacyName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{formatOrderStatus(item.status)}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Quantity:</Text>
            <Text style={styles.orderDetailValue}>{item.quantity} pills</Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Total:</Text>
            <Text style={styles.orderDetailValue}>${item.totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Order Date:</Text>
            <Text style={styles.orderDetailValue}>
              {new Date(item.orderDate).toLocaleDateString()}
            </Text>
          </View>
          {item.deliveryDate && (
            <View style={styles.orderDetailRow}>
              <Text style={styles.orderDetailLabel}>Delivery Date:</Text>
              <Text style={styles.orderDetailValue}>
                {new Date(item.deliveryDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {item.status !== OrderStatus.DELIVERED &&
          item.status !== OrderStatus.CANCELLED && (
            <TouchableOpacity
              style={styles.trackButton}
              onPress={() => {
                Alert.alert(
                  'Track Order',
                  'Your order is being processed. You will receive updates via notifications.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.trackButtonText}>Track Order</Text>
            </TouchableOpacity>
          )}
      </View>
    );
  };

  const renderOrderModal = () => (
    <Modal
      visible={showOrderModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowOrderModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Order Medicine</Text>

          {selectedMedicine && (
            <View style={styles.modalMedicineInfo}>
              <Text style={styles.modalMedicineName}>{selectedMedicine.name}</Text>
              <Text style={styles.modalDosage}>{selectedMedicine.dosage}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Number of pills"
              keyboardType="numeric"
              value={orderQuantity}
              onChangeText={setOrderQuantity}
            />
          </View>

          <Text style={styles.label}>Select Pharmacy</Text>
          {pharmacies.map((pharmacy) => (
            <TouchableOpacity
              key={pharmacy.id}
              style={[
                styles.pharmacyCard,
                selectedPharmacy?.id === pharmacy.id && styles.pharmacyCardSelected,
              ]}
              onPress={() => setSelectedPharmacy(pharmacy)}
            >
              <View>
                <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
                <Text style={styles.pharmacyDelivery}>
                  🚚 {pharmacy.estimatedDeliveryTime}
                </Text>
              </View>
              <View style={styles.pharmacyRating}>
                <Text style={styles.ratingText}>⭐ {pharmacy.rating}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[commonStyles.button, styles.modalButton]}
              onPress={handlePlaceOrder}
            >
              <Text style={commonStyles.buttonText}>Place Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[commonStyles.buttonSecondary, styles.modalButton]}
              onPress={() => {
                setShowOrderModal(false);
                setSelectedMedicine(null);
                setSelectedPharmacy(null);
              }}
            >
              <Text style={commonStyles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pharmacy</Text>
        <Text style={styles.headerSubtitle}>Order medicines & track deliveries</Text>
      </View>

      <FlatList
        data={[]}
        ListHeaderComponent={
          <>
            {lowStockMedicines.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>⚠️ Low Stock - Order Now</Text>
                </View>
                <FlatList
                  data={lowStockMedicines}
                  keyExtractor={(item) => item.id}
                  renderItem={renderLowStockItem}
                  scrollEnabled={false}
                />
              </>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📦 Your Orders</Text>
            </View>
            {orders.length > 0 ? (
              <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No Orders Yet</Text>
                <Text style={styles.emptyText}>
                  Order medicines when stock is low
                </Text>
              </View>
            )}
          </>
        }
        renderItem={() => null}
      />

      {renderOrderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  card: {
    ...commonStyles.card,
    marginHorizontal: spacing.md,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  stockInfo: {
    marginTop: 4,
  },
  stockText: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 4,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.ultraLightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  orderButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  orderButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderMedicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  orderPharmacy: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: spacing.sm,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  orderDetailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  trackButton: {
    ...commonStyles.buttonSecondary,
    marginTop: spacing.sm,
  },
  trackButtonText: {
    ...commonStyles.buttonSecondaryText,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalMedicineInfo: {
    backgroundColor: colors.ultraLightGray,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  modalMedicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalDosage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...commonStyles.inputLabel,
  },
  input: {
    ...commonStyles.input,
  },
  pharmacyCard: {
    backgroundColor: colors.ultraLightGray,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pharmacyCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pharmacyDelivery: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  pharmacyRating: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtons: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  modalButton: {
    width: '100%',
  },
});

export default PharmacyScreen;

