import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useProjects } from '../hooks/useProjects';
import { useAppContext } from '../../../contexts/AppContext';

interface ProjectSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (projectId: number | undefined, projectTitle?: string) => void;
    selectedProjectId?: number;
}

export const ProjectSelectorModal: React.FC<ProjectSelectorModalProps> = ({ 
    visible, 
    onClose, 
    onSelect, 
    selectedProjectId 
}) => {
    const { signed } = useAppContext();
    
    const { 
        projects, 
        loadingProjects, 
        loadMoreProjects, 
        refreshProjects,
        hasMoreProjects 
    } = useProjects(signed);

    useEffect(() => {
        if (visible) {
            refreshProjects();
        }
    }, [visible]);

    const renderFooter = () => {
        if (!loadingProjects) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} size="small" color="#EB5F1C" />;
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Selecione um Projeto</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={[{ id: 0, title: 'Todos os Projetos' }, ...projects]} 
                        keyExtractor={(item) => item.id.toString()}
                        onEndReached={() => {
                            if (hasMoreProjects && !loadingProjects) {
                                loadMoreProjects();
                            }
                        }}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={renderFooter}
                        renderItem={({ item }) => {
                            const isSelected = 
                                (item.id === 0 && selectedProjectId === undefined) || 
                                (item.id === selectedProjectId);

                            return (
                                <TouchableOpacity 
                                    style={[styles.item, isSelected && styles.itemSelected]}
                                    onPress={() => {
                                        const idToSend = item.id === 0 ? undefined : item.id;
                                        onSelect(idToSend, item.title);
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                                        {item.title}
                                    </Text>
                                    {isSelected && <Icon name="checkmark" size={20} color="#EB5F1C" />}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: '#2A2A2A', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '60%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#444', paddingBottom: 10 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#3C3C3C' },
    itemSelected: { backgroundColor: '#3C3C3C', borderRadius: 8, paddingHorizontal: 10, borderBottomWidth: 0 },
    itemText: { color: '#A9A9A9', fontSize: 16 },
    itemTextSelected: { color: '#EB5F1C', fontWeight: 'bold' }
});