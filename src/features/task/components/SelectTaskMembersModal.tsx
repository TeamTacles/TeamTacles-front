import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'; 
import Icon from 'react-native-vector-icons/Ionicons';
import { MainButton } from '../../../components/common/MainButton';
import { ProjectMember } from '../../project/services/projectService';

interface SelectTaskMembersModalProps {
  visible: boolean;
  projectMembers: ProjectMember[];
  onClose: () => void;
  onSave: (selectedMemberIds: number[]) => void;
  isSaving?: boolean; 
}

const MemberCheckbox = ({ member, isSelected, onSelect }: { member: ProjectMember, isSelected: boolean, onSelect: (id: number) => void }) => (
  <TouchableOpacity style={styles.memberRow} onPress={() => onSelect(member.userId)}>
    <Icon name={isSelected ? 'checkbox' : 'square-outline'} size={24} color="#EB5F1C" style={styles.checkbox} />
    <View style={styles.avatar}>
        <Text style={styles.avatarText}>{member.username.substring(0, 2).toUpperCase()}</Text>
    </View>
    <Text style={styles.memberName}>{member.username}</Text>
  </TouchableOpacity>
);

export const SelectTaskMembersModal: React.FC<SelectTaskMembersModalProps> = ({
    visible,
    projectMembers,
    onClose,
    onSave,
    isSaving = false 
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSaved, setIsSaved] = useState(false); 

  useEffect(() => {
    if (visible) {
      setSelectedIds([]);
      setIsSaved(false); 
    }
  }, [visible]);

  const handleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(memberId => memberId !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    setIsSaved(true); 
    onSave(selectedIds);
  };

  const handleClose = () => {
      // Só chama o onClose se não tiver sido salvo E não estiver salvando
      if(!isSaved && !isSaving) {
          onClose();
      }
  }

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Atribuir Responsáveis</Text>
                    <TouchableOpacity onPress={handleClose} disabled={isSaving}>
                        <Icon name="close-outline" size={30} color={isSaving ? "#555" : "#fff"} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={projectMembers}
                    keyExtractor={(item) => item.userId.toString()}
                    renderItem={({ item }) => (
                        <MemberCheckbox
                        member={item}
                        isSelected={selectedIds.includes(item.userId)}
                        onSelect={handleSelect}
                        />
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Não há membros neste projeto para atribuir.</Text>}
                />
                <View style={styles.buttonContainer}>
                    <MainButton
                        title={isSaving ? "Salvando..." : `Concluir (${selectedIds.length})`}
                        onPress={handleSave}
                        disabled={isSaving || selectedIds.length === 0} 
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
        width: '90%',
        maxHeight: '70%',
        backgroundColor: '#2A2A2A',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C3C'
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C3C'
    },
    checkbox: {
        marginRight: 15
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    memberName: {
        color: '#fff',
        fontSize: 16
    },
    emptyText: {
        color: '#A9A9A9',
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        paddingBottom: 30,
    },
    buttonContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#3C3C3C'
    }
});