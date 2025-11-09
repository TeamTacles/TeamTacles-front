import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import { DatePickerField } from '../../../components/common/DatePickerField';
import Icon from 'react-native-vector-icons/Ionicons';

interface EditDeadlineModalProps {
  visible: boolean;
  currentDate: Date;
  onClose: () => void;
  onSave: (newDate: Date) => void;
  isSaving?: boolean;
  isOverdue?: boolean;
}

export const EditDeadlineModal: React.FC<EditDeadlineModalProps> = ({
    visible,
    currentDate,
    onClose,
    onSave,
    isSaving = false,
    isOverdue = false
}) => {
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        if (visible && currentDate) {
            setDate(currentDate);
            setTime(currentDate);
        }
    }, [visible, currentDate]);

    const handleSave = () => {
        // Combina data e hora selecionadas
        const combined = new Date(date);
        combined.setHours(time.getHours());
        combined.setMinutes(time.getMinutes());
        combined.setSeconds(0);

        onSave(combined);
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={isSaving}>
                        <Icon name="close-outline" size={30} color={isSaving ? "#555" : "#fff"} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Editar Prazo</Text>
                    <ScrollView>
                        <DatePickerField
                            mode="date"
                            value={date}
                            onChange={setDate}
                            label="Data do Prazo"
                            minDate={new Date()}
                            isOverdue={isOverdue}
                            disabled={isSaving}
                        />
                        <DatePickerField
                            mode="time"
                            value={time}
                            onChange={setTime}
                            label="Hora do Prazo"
                            isOverdue={isOverdue}
                            disabled={isSaving}
                        />
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <MainButton
                        title={isSaving ? "Salvando..." : "Salvar Alterações"}
                        onPress={handleSave}
                        disabled={isSaving}
                      />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    modalView: {
        maxHeight: '80%',
        width: '90%',
        backgroundColor: '#2A2A2A',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
        textAlign: 'center'
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        zIndex: 1
    },
    buttonContainer: {
        marginTop: 20
    },
});
