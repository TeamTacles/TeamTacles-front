import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MainButton } from '../../../components/common/MainButton';
import { DatePickerField } from '../../../components/common/DatePickerField';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProjectSelectorModal } from '../../project/components/ProjectSelectorModal'; 
export interface Filters {
    createdAtAfter?: Date;
    createdAtBefore?: Date;
    dueDateAfter?: Date;
    dueDateBefore?: Date;
    status?: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
    projectId?: number; 
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
    const [showPickerFor, setShowPickerFor] = useState<'createdAtAfter' | 'createdAtBefore' | 'dueDateAfter' | 'dueDateBefore' | null>(null);
    
    const [isProjectSelectorVisible, setIsProjectSelectorVisible] = useState(false);
    const [selectedProjectName, setSelectedProjectName] = useState('Todos os Projetos');

    const handleApply = () => onApply(localFilters);

    const handleClear = () => {
        setLocalFilters({});
        setSelectedProjectName('Todos os Projetos'); 
        onClear();
    };

    const handleDateChange = (field: keyof Filters, date: Date) => {
        setLocalFilters(prev => ({ ...prev, [field]: date }));
        if (Platform.OS !== 'web') {
            setShowPickerFor(null);
        }
    };

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

    const renderDateInput = (label: string, field: 'createdAtAfter' | 'createdAtBefore' | 'dueDateAfter' | 'dueDateBefore') => {
        if (Platform.OS === 'web') {
            return (
                <DatePickerField
                    mode="date"
                    value={localFilters[field] || new Date()}
                    onChange={(date) => handleDateChange(field, date)}
                    label={label}
                />
            );
        }

        return (
            <>
                <Text style={styles.label}>{label}</Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowPickerFor(field)}>
                    <Text style={styles.dateText}>{formatDate(localFilters[field])}</Text>
                    <Icon name="calendar-outline" size={24} color="#A9A9A9" />
                </TouchableOpacity>
            </>
        );
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close-outline" size={30} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>
                        Filtrar {filterType === 'projects' ? 'Projetos' : filterType === 'tasks' ? 'Tarefas' : 'Equipes'}
                    </Text>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {filterType === 'tasks' && (
                            <>
                                <Text style={styles.label}>Filtrar por Projeto:</Text>
                                <TouchableOpacity 
                                    style={styles.dateInput} 
                                    onPress={() => setIsProjectSelectorVisible(true)}
                                >
                                    <Text style={[
                                        styles.dateText, 
                                        selectedProjectName !== 'Todos os Projetos' ? { color: '#EB5F1C', fontWeight: 'bold' } : {}
                                    ]}>
                                        {selectedProjectName}
                                    </Text>
                                    <Icon name="chevron-down-outline" size={24} color="#A9A9A9" />
                                </TouchableOpacity>

                                <Text style={styles.label}>Status:</Text>
                                <View style={styles.statusRow}>
                                    <TouchableOpacity onPress={() => toggleStatus('TO_DO')} style={[styles.statusButton, localFilters.status === 'TO_DO' && styles.statusSelected_ToDo, styles.ToDo_Button]}>
                                        <Text style={[styles.statusText, localFilters.status === 'TO_DO' && {color: '#000'}]}>A Fazer</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleStatus('IN_PROGRESS')} style={[styles.statusButton, localFilters.status === 'IN_PROGRESS' && styles.statusSelected_InProgress, styles.In_ProgressButton]}>
                                        <Text style={[styles.statusText, localFilters.status === 'IN_PROGRESS' && {color: '#000'}]}>Em Progresso</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.statusRow}>
                                    <TouchableOpacity onPress={() => toggleStatus('DONE')} style={[styles.statusButton, localFilters.status === 'DONE' && styles.statusSelected_Done, styles.DoneButton]}>
                                        <Text style={[styles.statusText, localFilters.status === 'DONE' && {color: '#000'}]}>Concluído</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleStatus('OVERDUE')} style={[styles.statusButton, localFilters.status === 'OVERDUE' && styles.statusSelected_Overdue, styles.overdueButton]}>
                                        <Text style={[styles.statusText, localFilters.status === 'OVERDUE' && {color: '#000'}]}>Atrasado</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.divider} />
                                <Text style={styles.sectionHeader}>Prazo</Text>
                                {renderDateInput("Prazo após:", 'dueDateAfter')}
                                {renderDateInput("Prazo antes de:", 'dueDateBefore')}
                            </>
                        )}
                        
                        {filterType !== 'tasks' && (
                            <>
                                {renderDateInput("Criado Após:", 'createdAtAfter')}
                                {renderDateInput("Criado Antes de:", 'createdAtBefore')}
                            </>
                        )}
                    </ScrollView>

                    {showPickerFor && Platform.OS !== 'web' && (
                        <DateTimePicker
                            mode="date"
                            display="default"
                            value={localFilters[showPickerFor] || new Date()}
                            onChange={onDateChangeMobile}
                        />
                    )}

                    <View style={styles.buttonContainer}>
                        <MainButton title="Limpar Filtros" onPress={handleClear} style={styles.clearButton} />
                        <MainButton title="Aplicar Filtros" onPress={handleApply} />
                    </View>
                </View>
            </View>

            <ProjectSelectorModal
                visible={isProjectSelectorVisible}
                onClose={() => setIsProjectSelectorVisible(false)}
                selectedProjectId={localFilters.projectId}
                onSelect={(id, title) => {
                    setLocalFilters(prev => ({ ...prev, projectId: id }));
                    if (title) setSelectedProjectName(title);
                    else if (!id) setSelectedProjectName('Todos os Projetos');
                }}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
    modalView: { 
        margin: 20, 
        backgroundColor: '#2A2A2A', 
        borderRadius: 20, padding: 25, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4, 
        elevation: 5, 
        width: '90%',
        maxHeight: '85%'
    },
    scrollContent: { paddingBottom: 10 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15, textAlign: 'center' },
    label: { fontSize: 14, color: '#A9A9A9', marginBottom: 8, marginTop: 10 },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#EB5F1C', marginTop: 10, marginBottom: 5 },
    closeButton: { position: 'absolute', top: 10, right: 10, padding: 5, zIndex: 10 },
    dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#3C3C3C', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 15, marginBottom: 10 },
    dateText: { color: '#fff', fontSize: 16 },
    buttonContainer: { marginTop: 20, gap: 10 },
    clearButton: { backgroundColor: '#555' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, gap: 10 },
    statusButton: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#3C3C3C', alignItems: 'center', borderWidth: 1, borderColor: '#555' },
    statusSelected_ToDo: { backgroundColor: '#FFA500', borderColor: '#FFA500' },
    statusSelected_InProgress: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    statusSelected_Done: { backgroundColor: '#3CB371', borderColor: '#3CB371' },
    statusSelected_Overdue: { backgroundColor: '#ff4545', borderColor: '#ff4545' },
    ToDo_Button: { borderColor: '#FFA500' },
    In_ProgressButton: { borderColor: '#FFD700' }, 
    DoneButton: { borderColor: '#3CB371' }, 
    overdueButton: { borderColor: '#ff4545' }, 
    statusText: { color: '#E0E0E0', fontWeight: 'bold', fontSize: 14 },
    divider: { height: 1, backgroundColor: '#444', marginVertical: 15 }
});