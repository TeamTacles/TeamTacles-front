import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MainButton } from './MainButton';
import Icon from 'react-native-vector-icons/Ionicons';

export interface MemberData {
    name: string;
    email: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

interface EditMemberRoleModalProps {
  visible: boolean;
  member: MemberData | null;
  onClose: () => void;
  onSave: (newRole: MemberData['role']) => void;
}

const ROLES: MemberData['role'][] = ['MEMBER', 'ADMIN', 'OWNER'];

const roleTranslations: Record<MemberData['role'], string> = {
    OWNER: 'Dono',
    ADMIN: 'Administrador',
    MEMBER: 'Membro',
};

export const EditMemberRoleModal: React.FC<EditMemberRoleModalProps> = ({ visible, member, onClose, onSave }) => {
    const [selectedRole, setSelectedRole] = useState<MemberData['role']>('MEMBER');
    const [isPickerVisible, setPickerVisible] = useState(false); 

    useEffect(() => {
        if (member) {
            setSelectedRole(member.role);
        }
    }, [member]);

    const handleSave = () => {
        if (member) {
            onSave(selectedRole);
        }
    };
    
    const handleSelectRole = (role: MemberData['role']) => {
        setSelectedRole(role);
        setPickerVisible(false);
    }
    
    const isOwner = member?.role === 'OWNER';

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close-outline" size={30} color="#fff" />
                    </TouchableOpacity>

                    {member && (
                        <>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{member.name.substring(0, 2).toUpperCase()}</Text>
                            </View>
                            <Text style={styles.name}>{member.name}</Text>
                            <Text style={styles.email}>{member.email}</Text>

                            <Text style={styles.label}>Cargo:</Text>
                            <TouchableOpacity 
                                style={styles.pickerButton} 
                                onPress={() => !isOwner && setPickerVisible(true)}
                                disabled={isOwner}
                            >
                                <Text style={styles.pickerButtonText}>{roleTranslations[selectedRole]}</Text>
                                <Icon name="chevron-down-outline" size={24} color="#A9A9A9" />
                            </TouchableOpacity>
                            
                            {isOwner && <Text style={styles.ownerNote}>O cargo de Dono não pode ser alterado.</Text>}
                            <View style={styles.buttonContainer}>
                                <MainButton title="Confirmar Alteração" onPress={handleSave} disabled={isOwner} />
                            </View>                        
                        </>
                    )}
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isPickerVisible}
                onRequestClose={() => setPickerVisible(false)}
            >
                <View style={styles.pickerCenteredView}>
                    <View style={styles.pickerModalView}>
                        <Text style={styles.pickerTitle}>Selecione um Cargo</Text>
                        {ROLES.map((role) => (
                           (role !== 'OWNER') && 
                            <TouchableOpacity 
                                key={role} 
                                style={styles.pickerItem} 
                                onPress={() => handleSelectRole(role)}
                            >
                                <Text style={styles.pickerItemText}>{roleTranslations[role]}</Text>
                            </TouchableOpacity>
                        ))}
                         <TouchableOpacity 
                            style={[styles.pickerItem, styles.cancelItem]} 
                            onPress={() => setPickerVisible(false)}
                        >
                            <Text style={[styles.pickerItemText, {color: '#ff4545'}]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        backgroundColor: '#2A2A2A', 
        borderRadius: 20, 
        padding: 25, 
        alignItems: 'center', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4, 
        elevation: 5 
    },
    closeButton: { 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        padding: 5 
    },
    avatar: {
        width: 80, 
        height: 80, 
        borderRadius: 40, 
        backgroundColor: '#555', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 10, 
    },
    avatarText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 32 
    },
    name: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#FFFFFF', 
        marginBottom: 5 
    },
    email: { 
        fontSize: 16, 
        color: '#A9A9A9', 
        marginBottom: 25 
    },
    label: { 
        fontSize: 16, 
        color: '#E0E0E0', 
        marginBottom: 8, 
        alignSelf: 'flex-start' 
    },
    ownerNote: { 
        color: '#FFD700', 
        fontSize: 12, 
        marginBottom: 20, 
        textAlign: 'center' 
    },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%', 
        backgroundColor: '#232323',
        borderRadius: 8, 
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EB5F1C',
    },
    pickerButtonText: {
        color: '#fff',
        fontSize: 16,
        textTransform: 'capitalize',
    },
    pickerCenteredView: {
        flex: 1,
        justifyContent: 'flex-end', 
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    pickerModalView: {
        backgroundColor: '#2A2A2A',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A9A9A9',
        textAlign: 'center',
        marginBottom: 20,
    },
    pickerItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C3C',
    },
    pickerItemText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
    cancelItem: {
        borderBottomWidth: 0,
        marginTop: 10,
    },
    buttonContainer: {
        width: '100%'
    }
});