import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, MedicineSchedule } from '../types';
import { colors } from '../theme/colors';
import { commonStyles, spacing } from '../theme/styles';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import apiService from '../services/apiService';

interface ScheduleScreenProps {
  navigation: any;
}

interface ScheduleItem {
  id: string;
  medicine: Medicine;
  time: string;
  scheduledDateTime: Date;
  taken: boolean;
  takenAt?: Date;
  skipped: boolean;
}

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ navigation }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateSchedule();
  }, [medicines, selectedDate]);

  const loadData = async () => {
    try {
      const storedMedicines = await AsyncStorage.getItem('medicines');
      if (storedMedicines) {
        setMedicines(JSON.parse(storedMedicines));
      }

      const storedSchedules = await AsyncStorage.getItem('schedules');
      if (storedSchedules) {
        // Load completed schedules
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const generateSchedule = () => {
    const scheduleItems: ScheduleItem[] = [];

    medicines.forEach((medicine) => {
      medicine.times.forEach((time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledDateTime = new Date(selectedDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);

        scheduleItems.push({
          id: `${medicine.id}-${time}`,
          medicine,
          time,
          scheduledDateTime,
          taken: false,
          skipped: false,
        });
      });
    });

    scheduleItems.sort((a, b) => a.scheduledDateTime.getTime() - b.scheduledDateTime.getTime());
    setSchedules(scheduleItems);
  };

  const handleTakeMedicine = async (item: ScheduleItem) => {
    const updatedSchedules = schedules.map((s) =>
      s.id === item.id ? { ...s, taken: true, takenAt: new Date() } : s
    );
    setSchedules(updatedSchedules);

    // Save to storage
    await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));

    // Record intake via API
    try {
      await apiService.recordIntake(item.medicine.id, item.scheduledDateTime, true);
    } catch (error) {
      console.error('Failed to record intake:', error);
    }

    Alert.alert(
      'Great! 🎉',
      `You've taken ${item.medicine.name}. Keep up the good work!`,
      [{ text: 'OK' }]
    );
  };

  const handleSkipMedicine = async (item: ScheduleItem) => {
    Alert.alert(
      'Skip Medicine?',
      `Are you sure you want to skip ${item.medicine.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            const updatedSchedules = schedules.map((s) =>
              s.id === item.id ? { ...s, skipped: true } : s
            );
            setSchedules(updatedSchedules);
            await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));
            
            try {
              await apiService.recordIntake(item.medicine.id, item.scheduledDateTime, false);
            } catch (error) {
              console.error('Failed to record skip:', error);
            }
          },
        },
      ]
    );
  };

  const getScheduleStatus = (item: ScheduleItem) => {
    if (item.taken) return 'taken';
    if (item.skipped) return 'skipped';
    if (isBefore(item.scheduledDateTime, new Date()) && isToday(item.scheduledDateTime)) {
      return 'missed';
    }
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken':
        return colors.success;
      case 'skipped':
        return colors.warning;
      case 'missed':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return '✓';
      case 'skipped':
        return '⊘';
      case 'missed':
        return '✕';
      default:
        return '○';
    }
  };

  const renderScheduleItem = ({ item }: { item: ScheduleItem }) => {
    const status = getScheduleStatus(item);
    const statusColor = getStatusColor(status);
    const isPast = isBefore(item.scheduledDateTime, new Date());
    const canTake = isToday(item.scheduledDateTime) && !item.taken && !item.skipped;

    return (
      <View style={[styles.scheduleCard, { borderLeftColor: item.medicine.color }]}>
        <View style={styles.scheduleLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
            <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>
          </View>
        </View>

        <View style={styles.scheduleMiddle}>
          <Text style={styles.medicineName}>{item.medicine.name}</Text>
          <Text style={styles.dosage}>{item.medicine.dosage}</Text>
          <Text style={styles.time}>⏰ {item.time}</Text>
          {item.takenAt && (
            <Text style={styles.takenText}>
              Taken at {format(item.takenAt, 'HH:mm')}
            </Text>
          )}
        </View>

        <View style={styles.scheduleRight}>
          {canTake && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleTakeMedicine(item)}
              >
                <Text style={styles.actionButtonText}>✓ Take</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.skipButton]}
                onPress={() => handleSkipMedicine(item)}
              >
                <Text style={[styles.actionButtonText, styles.skipButtonText]}>
                  Skip
                </Text>
              </TouchableOpacity>
            </>
          )}
          {status === 'taken' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Completed</Text>
            </View>
          )}
          {status === 'skipped' && (
            <View style={[styles.statusBadge, { backgroundColor: colors.warning }]}>
              <Text style={styles.statusBadgeText}>Skipped</Text>
            </View>
          )}
          {status === 'missed' && (
            <View style={[styles.statusBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.statusBadgeText}>Missed</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getTodayStats = () => {
    const total = schedules.length;
    const taken = schedules.filter((s) => s.taken).length;
    const skipped = schedules.filter((s) => s.skipped).length;
    const missed = schedules.filter((s) => {
      const status = getScheduleStatus(s);
      return status === 'missed';
    }).length;

    return { total, taken, skipped, missed };
  };

  const stats = getTodayStats();

  const renderHeader = () => (
    <View>
      <View style={styles.dateSelector}>
        <TouchableOpacity
          onPress={() => {
            const prevDate = new Date(selectedDate);
            prevDate.setDate(prevDate.getDate() - 1);
            setSelectedDate(prevDate);
          }}
        >
          <Text style={styles.dateArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>
          {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM dd, yyyy')}
        </Text>
        <TouchableOpacity
          onPress={() => {
            const nextDate = new Date(selectedDate);
            nextDate.setDate(nextDate.getDate() + 1);
            setSelectedDate(nextDate);
          }}
        >
          <Text style={styles.dateArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {isToday(selectedDate) && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {stats.taken}
            </Text>
            <Text style={styles.statLabel}>Taken</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {stats.skipped}
            </Text>
            <Text style={styles.statLabel}>Skipped</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.error }]}>
              {stats.missed}
            </Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Schedule</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyTitle}>No Schedule for This Day</Text>
      <Text style={styles.emptyText}>
        Add medicines to see your daily schedule
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={renderScheduleItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  dateArrow: {
    fontSize: 24,
    color: colors.primary,
    paddingHorizontal: spacing.md,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  scheduleCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    borderLeftWidth: 4,
  },
  scheduleLeft: {
    marginRight: spacing.md,
  },
  statusIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 18,
    color: colors.white,
    fontWeight: 'bold',
  },
  scheduleMiddle: {
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
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  takenText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
  },
  scheduleRight: {
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButtonText: {
    color: colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: colors.success,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
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
  },
});

export default ScheduleScreen;

