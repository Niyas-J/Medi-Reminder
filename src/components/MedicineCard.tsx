import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Medicine } from '../types';
import { colors } from '../theme/colors';
import { commonStyles, spacing } from '../theme/styles';

interface MedicineCardProps {
  medicine: Medicine;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onPress,
  onEdit,
  onDelete,
}) => {
  const stockPercentage = (medicine.currentStock / medicine.totalStock) * 100;
  const needsRefill = stockPercentage <= 30;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to delete ${medicine.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: medicine.color, borderLeftWidth: 4 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.dosage}>{medicine.dosage}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <Text style={styles.iconText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Text style={styles.iconText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Schedule Times */}
      <View style={styles.timesContainer}>
        <Text style={styles.label}>Schedule:</Text>
        <View style={styles.timesRow}>
          {medicine.times.map((time, index) => (
            <View key={index} style={styles.timeChip}>
              <Text style={styles.timeText}>⏰ {time}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stock Information */}
      <View style={styles.stockContainer}>
        <View style={styles.stockInfo}>
          <Text style={styles.label}>Stock:</Text>
          <Text style={[styles.stockText, needsRefill && styles.lowStock]}>
            {medicine.currentStock} / {medicine.totalStock} pills
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${stockPercentage}%`,
                backgroundColor: needsRefill ? colors.error : colors.success,
              },
            ]}
          />
        </View>
      </View>

      {/* Refill Alert */}
      {needsRefill && (
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>
            ⚠️ Low stock! Refill by {formatDate(medicine.refillDate)}
          </Text>
        </View>
      )}

      {/* Duration */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📅 {formatDate(medicine.startDate)} → {formatDate(medicine.endDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    marginHorizontal: spacing.md,
  },
  header: {
    ...commonStyles.rowBetween,
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    ...commonStyles.row,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  iconButton: {
    padding: spacing.sm,
  },
  iconText: {
    fontSize: 20,
  },
  timesContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  stockContainer: {
    marginBottom: spacing.sm,
  },
  stockInfo: {
    ...commonStyles.rowBetween,
    marginBottom: spacing.xs,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  lowStock: {
    color: colors.error,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.ultraLightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  alertContainer: {
    backgroundColor: colors.warning + '20',
    padding: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  alertText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default MedicineCard;

