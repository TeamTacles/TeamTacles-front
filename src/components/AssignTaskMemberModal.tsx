// src/components/AssignTaskMemberModal.tsx

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Member {
  userId: number;
  username: string;
}

interface AssignTaskMemberModalProps {
  visible: boolean;
  projectMembers: Member[];
  assignedUserIds: number[];
  onClose: () => void;
  onAssign: (userId: number) => void;
}

export const AssignTaskMemberModal: React.FC<AssignTaskMemberModalProps> = ({ visible, projectMembers, assignedUserIds, onClose, onAssign }) => {
  
  // Filtra a lista para mostrar apenas membros que ainda não estão na tarefa
  const availableMembers = projectMembers.filter(
    (member) => !assignedUserIds.includes(member.userId)
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Adicionar Responsável</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={availableMembers}
            keyExtractor={(item) => item.userId.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.memberRow} onPress={() => onAssign(item.userId)}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.username.substring(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.memberName}>{item.username}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Todos os membros do projeto já foram adicionados.</Text>}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center' },
    container: { flex: 1, backgroundColor: '#2A2A2A', marginVertical: '10%', marginHorizontal: '5%', borderRadius: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#3C3C3C' },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    memberRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#3C3C3C' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#555', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { color: '#fff', fontWeight: 'bold' },
    memberName: { color: '#fff', fontSize: 16 },
    emptyText: { color: '#A9A9A9', textAlign: 'center', marginTop: 30, fontSize: 16 }
});