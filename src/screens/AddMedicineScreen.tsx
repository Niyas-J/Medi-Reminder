import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Medicine, MedicineFrequency } from '../types';
import { colors } from '../theme/colors';
import { commonStyles, spacing } from '../theme/styles';

interface AddMedicineScreenProps {
  navigation: any;
  route: any;
}

const AddMedicineScreen: React.FC<AddMedicineScreenProps> = ({ navigation, route }) => {
  const editingMedicine = route.params?.medicine;
  const isEditing = !!editingMedicine;

  const [name, setName] = useState(editingMedicine?.name || '');
  const [dosage, setDosage] = useState(editingMedicine?.dosage || '');
  const [frequency, setFrequency] = useState<MedicineFrequency>(
    editingMedicine?.frequency || MedicineFrequency.ONCE_DAILY
  );
  const [times, setTimes] = useState<string[]>(editingMedicine?.times || ['09:00']);
  const [startDate, setStartDate] = useState<Date>(
    editingMedicine?.startDate ? new Date(editingMedicine.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    editingMedicine?.endDate
      ? new Date(editingMedicine.endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [refillDate, setRefillDate] = useState<Date>(
    editingMedicine?.refillDate
      ? new Date(editingMedicine.refillDate)
      : new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
  );
  const [currentStock, setCurrentStock] = useState(
    editingMedicine?.currentStock?.toString() || '30'
  );
  const [totalStock, setTotalStock] = useState(
    editingMedicine?.totalStock?.toString() || '30'
  );
  const [instructions, setInstructions] = useState(editingMedicine?.instructions || '');
  const [selectedColor, setSelectedColor] = useState(
    editingMedicine?.color || colors.medicineColors[0]
  );

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<
    'start' | 'end' | 'refill' | null
  >(null);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Medicine' : 'Add Medicine',
    });
  }, []);

  const frequencies = [
    { value: MedicineFrequency.ONCE_DAILY, label: 'Once Daily', timesCount: 1 },
    { value: MedicineFrequency.TWICE_DAILY, label: 'Twice Daily', timesCount: 2 },
    { value: MedicineFrequency.THREE_TIMES_DAILY, label: '3 Times Daily', timesCount: 3 },
    { value: MedicineFrequency.FOUR_TIMES_DAILY, label: '4 Times Daily', timesCount: 4 },
  ];

  const handleFrequencyChange = (newFrequency: MedicineFrequency) => {
    setFrequency(newFrequency);
    const freqData = frequencies.find((f) => f.value === newFrequency);
    if (freqData) {
      const defaultTimes = ['09:00', '14:00', '19:00', '22:00'].slice(
        0,
        freqData.timesCount
      );
      setTimes(defaultTimes);
    }
  };

  const handleTimeConfirm = (date: Date) => {
    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    if (editingTimeIndex !== null) {
      const newTimes = [...times];
      newTimes[editingTimeIndex] = timeString;
      setTimes(newTimes);
    }

    setShowTimePicker(false);
    setEditingTimeIndex(null);
  };

  const handleDateConfirm = (date: Date) => {
    if (showDatePicker === 'start') {
      setStartDate(date);
    } else if (showDatePicker === 'end') {
      setEndDate(date);
    } else if (showDatePicker === 'refill') {
      setRefillDate(date);
    }
    setShowDatePicker(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter medicine name');
      return false;
    }
    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter dosage');
      return false;
    }
    if (times.length === 0) {
      Alert.alert('Error', 'Please set at least one time');
      return false;
    }
    if (parseInt(currentStock) > parseInt(totalStock)) {
      Alert.alert('Error', 'Current stock cannot exceed total stock');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const medicine: Medicine = {
      id: editingMedicine?.id || Date.now().toString(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency,
      times,
      startDate,
      endDate,
      refillDate,
      currentStock: parseInt(currentStock),
      totalStock: parseInt(totalStock),
      instructions: instructions.trim(),
      color: selectedColor,
    };

    route.params?.onSave(medicine);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Medicine Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medicine Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Aspirin"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Dosage */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dosage *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500mg"
            value={dosage}
            onChangeText={setDosage}
          />
        </View>

        {/* Frequency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Frequency *</Text>
          <View style={styles.frequencyContainer}>
            {frequencies.map((freq) => (
              <TouchableOpacity
                key={freq.value}
                style={[
                  styles.frequencyChip,
                  frequency === freq.value && styles.frequencyChipActive,
                ]}
                onPress={() => handleFrequencyChange(freq.value)}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    frequency === freq.value && styles.frequencyTextActive,
                  ]}
                >
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Times */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Times *</Text>
          <View style={styles.timesContainer}>
            {times.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={styles.timeButton}
                onPress={() => {
                  setEditingTimeIndex(index);
                  setShowTimePicker(true);
                }}
              >
                <Text style={styles.timeButtonText}>⏰ {time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker('start')}
            >
              <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateGroup}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker('end')}
            >
              <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stock */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stock Information</Text>
          <View style={styles.stockRow}>
            <View style={styles.stockInput}>
              <Text style={styles.stockLabel}>Current</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={currentStock}
                onChangeText={setCurrentStock}
              />
            </View>
            <View style={styles.stockInput}>
              <Text style={styles.stockLabel}>Total</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={totalStock}
                onChangeText={setTotalStock}
              />
            </View>
          </View>
        </View>

        {/* Refill Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Refill Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker('refill')}
          >
            <Text style={styles.dateButtonText}>{formatDate(refillDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Color Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Color Tag</Text>
          <View style={styles.colorContainer}>
            {colors.medicineColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., Take with food"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Update Medicine' : 'Add Medicine'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Time Picker Modal */}
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => {
          setShowTimePicker(false);
          setEditingTimeIndex(null);
        }}
      />

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker !== null}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...commonStyles.inputLabel,
  },
  input: {
    ...commonStyles.input,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  frequencyChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  frequencyChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  frequencyTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  timeButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  datesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  dateGroup: {
    flex: 1,
  },
  dateButton: {
    ...commonStyles.input,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  stockRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stockInput: {
    flex: 1,
  },
  stockLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.textPrimary,
    borderWidth: 3,
  },
  saveButton: {
    ...commonStyles.button,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  saveButtonText: {
    ...commonStyles.buttonText,
  },
});

export default AddMedicineScreen;

