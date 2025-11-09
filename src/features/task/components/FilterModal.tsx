import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MainButton } from '../../../components/common/MainButton';
import { DatePickerField } from '../../../components/common/DatePickerField';
import Icon from 'react-native-vector-icons/Ionicons';

export interface Filters {
    createdAtAfter?: Date;
    createdAtBefore?: Date;
    status?: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
}

interface FilterModalProps {
    visible: boolean;
    filterType: 'projects' | 'tasks' | 'teams'; 
    onClose: () => void;
    onApply: (filters: Filters) => void;
    onClear: () => void;
}

const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Selecione uma data';
    return date.toLocaleDateString('pt-BR');
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, filterType, onClose, onApply, onClear }) => {
    const [localFilters, setLocalFilters] = useState<Filters>({});
    const [showPickerFor, setShowPickerFor] = useState<'createdAtAfter' | 'createdAtBefore' | null>(null);

    const handleApply = () => onApply(localFilters);

    const handleClear = () => {
        setLocalFilters({});
        onClear();
    };

    const handleDateChange = (field: 'createdAtAfter' | 'createdAtBefore', date: Date) => {
        setLocalFilters(prev => ({ ...prev, [field]: date }));
        if (Platform.OS !== 'web') {
            setShowPickerFor(null); 
        }
    };

    // Handler para DateTimePicker no mobile
    const onDateChangeMobile = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate;

        if (event.type === 'set' && currentDate && showPickerFor) {
            setLocalFilters(prev => ({ ...prev, [showPickerFor]: currentDate }));
        }

        setShowPickerFor(null); 
    };

    const toggleStatus = (status: Filters['status']) => {
        setLocalFilters(prev => ({
            ...prev,
            status: prev.status === status ? undefined : status,
        }));
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close-outline" size={30} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>Filtrar {filterType === 'projects' ? 'Projetos' : filterType === 'tasks' ? 'Tarefas' : 'Equipes'}</Text>

                    {filterType === 'tasks' && (
                        <>
                            <Text style={styles.label}>Status:</Text>
                            <View style={styles.statusContainer}>
                                <TouchableOpacity onPress={() => toggleStatus('TO_DO')} style={[styles.statusButton, localFilters.status === 'TO_DO' && styles.statusSelected]}>
                                    <Text style={styles.statusText}>A Fazer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => toggleStatus('IN_PROGRESS')} style={[styles.statusButton, localFilters.status === 'IN_PROGRESS' && styles.statusSelected]}>
                                    <Text style={styles.statusText}>Em Progresso</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => toggleStatus('DONE')} style={[styles.statusButton, localFilters.status === 'DONE' && styles.statusSelected]}>
                                    <Text style={styles.statusText}>Concluído</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {Platform.OS === 'web' ? (
                        <>
                            <DatePickerField
                                mode="date"
                                value={localFilters.createdAtAfter || new Date()}
                                onChange={(date) => handleDateChange('createdAtAfter', date)}
                                label="Criado Após:"
                            />
                            <DatePickerField
                                mode="date"
                                value={localFilters.createdAtBefore || new Date()}
                                onChange={(date) => handleDateChange('createdAtBefore', date)}
                                label="Criado Antes de:"
                            />
                        </>
                    ) : (
                        <>
                            <Text style={styles.label}>Criado Após:</Text>
                            <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickerFor('createdAtAfter')}>
                                <Text style={styles.dateText}>{formatDate(localFilters.createdAtAfter)}</Text>
                                <Icon name="calendar-outline" size={24} color="#A9A9A9" />
                            </TouchableOpacity>

                            <Text style={styles.label}>Criado Antes de:</Text>
                            <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickerFor('createdAtBefore')}>
                                <Text style={styles.dateText}>{formatDate(localFilters.createdAtBefore)}</Text>
                                <Icon name="calendar-outline" size={24} color="#A9A9A9" />
                            </TouchableOpacity>

                            {showPickerFor && (
                                <DateTimePicker
                                    mode="date"
                                    display="default"
                                    value={localFilters[showPickerFor] || new Date()}
                                    onChange={onDateChangeMobile}
                                />
                            )}
                        </>
                    )}

                    <View style={styles.buttonContainer}>
                        <MainButton title="Limpar Filtros" onPress={handleClear} style={styles.clearButton} />
                        <MainButton title="Aplicar Filtros" onPress={handleApply} />
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
        margin: 20, 
        backgroundColor: '#2A2A2A', 
        borderRadius: 20, padding: 25, 
        alignItems: 'stretch', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4, 
        elevation: 5, 
        width: '90%' 
    },
    modalTitle: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#FFFFFF', 
        marginBottom: 25, 
        textAlign: 'center' 
    },
    label: { 
        fontSize: 16, 
        color: '#E0E0E0', 
        marginBottom: 8, 
        marginTop: 10 
    },
    closeButton: { 
        position: 'absolute', 
        top: 10, right: 10, 
        padding: 5 
    },
    dateInput: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#3C3C3C', 
        borderRadius: 8, 
        paddingVertical: 12, 
        paddingHorizontal: 15, 
        marginBottom: 10
    },
    dateText: { 
        color: '#fff', 
        fontSize: 16 
    },
    buttonContainer: { 
        marginTop: 20 
    },
    clearButton: {
        backgroundColor: '#888', 
    },
    statusContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        marginBottom: 15 
    },
    statusButton: { 
        paddingVertical: 8, 
        paddingHorizontal: 12, 
        borderRadius: 20, 
        backgroundColor: '#555' 
    },
    statusSelected: { 
        backgroundColor: '#EB5F1C' 
    },
    statusText: { 
        color: '#fff', 
        fontWeight: 'bold' 
    }
});