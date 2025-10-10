// src/components/FilterPicker.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/Ionicons';

interface Item {
  label: string;
  value: string | number;
  color?: string;
}

interface FilterPickerProps {
  label: string;
  items: Item[];
  selectedValue: string | number | null;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
}

export const FilterPicker: React.FC<FilterPickerProps> = ({ label, items, selectedValue, onValueChange, placeholder = "Selecione..." }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);
  const selectedItemLabel = selectedItem?.label || placeholder;
  const selectedItemColor = selectedItem?.color;

  const handleSelect = (value: string | number) => {
    onValueChange(value);
    setModalVisible(false);
  };

  // Define a cor do ícone e do texto com base na cor de fundo
  const contentColor = selectedItemColor ? '#000000' : '#FFFFFF';

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity 
          style={[styles.pickerButton, selectedItemColor ? { backgroundColor: selectedItemColor } : null]} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.pickerText, { color: contentColor }]} numberOfLines={1}>
            {selectedItemLabel}
          </Text>
          <Icon name="chevron-down-outline" size={20} color={selectedItemColor ? contentColor : '#A9A9A9'} />
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.bottomSheetOverlay} activeOpacity={1} onPressOut={() => setModalVisible(false)}>
          <View style={styles.bottomSheetView}>
            <Text style={styles.modalTitle}>{`Selecione um ${label}`}</Text>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.itemButton} onPress={() => handleSelect(item.value)}>
                  <Text style={[styles.itemText, { color: item.color || '#FFFFFF' }]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.itemButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={[styles.itemText, styles.cancelText]}>Cancelar</Text>
            </TouchableOpacity>
            <SafeAreaView edges={['bottom']} />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
    container: { width: '100%', marginBottom: 15 },
    label: { color: '#A9A9A9', fontSize: 14, marginBottom: 8 },
    pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#3C3C3C', borderRadius: 8, paddingHorizontal: 12, height: 45 },
    pickerText: { fontSize: 16, flex: 1, marginRight: 5, fontWeight: 'bold' },
    bottomSheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.7)', },
    bottomSheetView: { backgroundColor: '#2A2A2A', width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, maxHeight: '50%', },
    modalTitle: { color: '#A9A9A9', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', },
    itemButton: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#3C3C3C', },
    itemText: { fontSize: 18, textAlign: 'center', fontWeight: 'bold' },
    cancelButton: { borderBottomWidth: 0, marginTop: 10, },
    cancelText: { color: '#ff4545', fontWeight: 'bold', },
});