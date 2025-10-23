import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine } from '../types';
import MedicineCard from '../components/MedicineCard';
import { colors } from '../theme/colors';
import { commonStyles, spacing } from '../theme/styles';
import notificationService from '../services/notificationService';
import apiService from '../services/apiService';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicines();
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    await notificationService.requestPermissions();
  };

  const loadMedicines = async () => {
    try {
      // Load from local storage first
      const storedMedicines = await AsyncStorage.getItem('medicines');
      if (storedMedicines) {
        setMedicines(JSON.parse(storedMedicines));
      }

      // Then try to sync with API
      // const apiMedicines = await apiService.getMedicines();
      // setMedicines(apiMedicines);
      // await AsyncStorage.setItem('medicines', JSON.stringify(apiMedicines));
    } catch (error) {
      console.error('Failed to load medicines:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMedicines();
  };

  const handleAddMedicine = () => {
    navigation.navigate('AddMedicine', { onSave: handleSaveMedicine });
  };

  const handleSaveMedicine = async (newMedicine: Medicine) => {
    try {
      // Save locally
      const updatedMedicines = [...medicines, newMedicine];
      setMedicines(updatedMedicines);
      await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));

      // Schedule notifications
      notificationService.scheduleMedicineNotifications(newMedicine);
      notificationService.scheduleRefillNotification(newMedicine);

      // Sync with API
      // await apiService.addMedicine(newMedicine);
    } catch (error) {
      console.error('Failed to save medicine:', error);
    }
  };

  const handleEditMedicine = (medicine: Medicine) => {
    navigation.navigate('AddMedicine', {
      medicine,
      onSave: async (updatedMedicine: Medicine) => {
        const updatedMedicines = medicines.map((m) =>
          m.id === updatedMedicine.id ? updatedMedicine : m
        );
        setMedicines(updatedMedicines);
        await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));

        // Reschedule notifications
        notificationService.cancelMedicineNotifications(medicine.id);
        notificationService.scheduleMedicineNotifications(updatedMedicine);
        notificationService.scheduleRefillNotification(updatedMedicine);
      },
    });
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    try {
      const updatedMedicines = medicines.filter((m) => m.id !== medicineId);
      setMedicines(updatedMedicines);
      await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));

      // Cancel notifications
      notificationService.cancelMedicineNotifications(medicineId);

      // Sync with API
      // await apiService.deleteMedicine(medicineId);
    } catch (error) {
      console.error('Failed to delete medicine:', error);
    }
  };

  const handleMedicinePress = (medicine: Medicine) => {
    navigation.navigate('MedicineDetails', { medicine });
  };

  const getTodayScheduleCount = () => {
    let count = 0;
    medicines.forEach((medicine) => {
      count += medicine.times.length;
    });
    return count;
  };

  const getLowStockCount = () => {
    return medicines.filter(
      (m) => (m.currentStock / m.totalStock) * 100 <= 30
    ).length;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hello! 👋</Text>
        <Text style={styles.subtitle}>Stay healthy, stay on track</Text>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
        <Text style={styles.statNumber}>{medicines.length}</Text>
        <Text style={styles.statLabel}>Active Medicines</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.secondary + '15' }]}>
        <Text style={styles.statNumber}>{getTodayScheduleCount()}</Text>
        <Text style={styles.statLabel}>Today's Doses</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
        <Text style={styles.statNumber}>{getLowStockCount()}</Text>
        <Text style={styles.statLabel}>Need Refill</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💊</Text>
      <Text style={styles.emptyTitle}>No Medicines Added</Text>
      <Text style={styles.emptyText}>
        Start by adding your first medicine to get reminders
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddMedicine}>
        <Text style={styles.emptyButtonText}>Add Medicine</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderStats()}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Medicines</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <MedicineCard
            medicine={item}
            onPress={() => handleMedicinePress(item)}
            onEdit={() => handleEditMedicine(item)}
            onDelete={() => handleDeleteMedicine(item.id)}
          />
        )}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddMedicine}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
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
    marginBottom: spacing.lg,
  },
  emptyButton: {
    ...commonStyles.button,
  },
  emptyButtonText: {
    ...commonStyles.buttonText,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...commonStyles.shadowLarge,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
  },
});

export default HomeScreen;

