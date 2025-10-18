// src/features/team/components/EditMemberRoleModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MainButton } from '../../../components/common/MainButton';
import Icon from 'react-native-vector-icons/Ionicons';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';

export interface MemberData {
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

interface EditMemberRoleModalProps {
  visible: boolean;
  member: MemberData | null;
  currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER'; // Papel do usuário logado
  onClose: () => void;
  onSave: (newRole: MemberData['role']) => void;
  onDelete: () => void;
}

const ROLES: MemberData['role'][] = ['MEMBER', 'ADMIN', 'OWNER'];

const roleTranslations: Record<MemberData['role'], string> = {
    OWNER: 'Dono',
    ADMIN: 'Administrador',
    MEMBER: 'Membro',
};

export const EditMemberRoleModal: React.FC<EditMemberRoleModalProps> = ({ visible, member, currentUserRole, onClose, onSave, onDelete }) => {
    const [selectedRole, setSelectedRole] = useState<MemberData['role']>('MEMBER');
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

    useEffect(() => {
        if (member) {
            setSelectedRole(member.role);
        }
    }, [member]);

    const handleSave = () => {
        if (member && !cannotEditRole) { // Verifica se pode editar antes de salvar
            onSave(selectedRole);
        }
    };

    const handleSelectRole = (role: MemberData['role']) => {
        setSelectedRole(role);
        setPickerVisible(false);
    }

    const handleConfirmDelete = () => {
        setConfirmDeleteVisible(false);
        onDelete();
    };

    const isMemberOwner = member?.role === 'OWNER';
    // --- LÓGICA DE PERMISSÃO APRIMORADA ---
    // Não pode editar se:
    // 1. O membro selecionado é o OWNER
    // 2. O usuário atual é ADMIN e o membro selecionado também é ADMIN
    const cannotEditRole = isMemberOwner || (currentUserRole === 'ADMIN' && member?.role === 'ADMIN');

    // Quem pode deletar: OWNER pode deletar ADMIN e MEMBER. ADMIN pode deletar MEMBER. Ninguém deleta OWNER.
    const canDelete = (currentUserRole === 'OWNER' || (currentUserRole === 'ADMIN' && member?.role === 'MEMBER')) && !isMemberOwner; //

    return (
        <>
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
                                    style={[styles.pickerButton, cannotEditRole && styles.disabledPickerButton]} // Estilo desabilitado
                                    onPress={() => !cannotEditRole && setPickerVisible(true)} // Só abre se puder editar
                                    disabled={cannotEditRole} // Desabilita o toque
                                >
                                    <Text style={styles.pickerButtonText}>{roleTranslations[selectedRole]}</Text>
                                    <Icon name="chevron-down-outline" size={24} color={cannotEditRole ? "#555" : "#A9A9A9"} />
                                </TouchableOpacity>

                                {/* Mensagem informativa sobre a restrição */}
                                {cannotEditRole && (
                                    <Text style={styles.permissionNote}>
                                        {isMemberOwner
                                            ? 'O cargo de Dono não pode ser alterado.'
                                            : 'Administradores não podem alterar o cargo de outros administradores.'}
                                    </Text>
                                )}

                                <View style={styles.buttonContainer}>
                                    <MainButton
                                        title="Confirmar Alteração"
                                        onPress={handleSave}
                                        disabled={cannotEditRole} // Desabilita o botão se não puder editar
                                    />
                                </View>

                                {canDelete && (
                                    <>
                                        <View style={styles.divider} />
                                        <TouchableOpacity style={styles.deleteButton} onPress={() => setConfirmDeleteVisible(true)}>
                                            <Icon name="trash-outline" size={20} color="#ff4545" />
                                            <Text style={styles.deleteButtonText}>Remover da Equipe</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                </View>

                {/* Picker de cargos (sem alteração significativa, exceto a remoção do OWNER da lista selecionável) */}
                <Modal
                    animationType="slide" transparent={true} visible={isPickerVisible}
                    onRequestClose={() => setPickerVisible(false)}
                >
                    <TouchableOpacity style={styles.pickerCenteredView} activeOpacity={1} onPressOut={() => setPickerVisible(false)}>
                        <View style={styles.pickerModalView}>
                            <Text style={styles.pickerTitle}>Selecione um Cargo</Text>
                            {/* Filtra para não mostrar OWNER como opção selecionável */}
                            {ROLES.filter(role => role !== 'OWNER').map((role) => (
                                <TouchableOpacity key={role} style={styles.pickerItem} onPress={() => handleSelectRole(role)}>
                                    <Text style={styles.pickerItemText}>{roleTranslations[role]}</Text>
                                </TouchableOpacity>
                            ))}
                             <TouchableOpacity style={[styles.pickerItem, styles.cancelItem]} onPress={() => setPickerVisible(false)}>
                                <Text style={[styles.pickerItemText, {color: '#ff4545'}]}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </Modal>

            {/* Modal de confirmação para remover membro */}
            {member && (
                <ConfirmationModal
                    visible={isConfirmDeleteVisible}
                    title="Remover Membro"
                    message={`Você tem certeza que deseja remover ${member.name} da equipe? Esta ação não pode ser desfeita.`}
                    onClose={() => setConfirmDeleteVisible(false)}
                    onConfirm={handleConfirmDelete}
                    confirmText="Remover"
                />
            )}
        </>
    );
};

// Adicione estes estilos aos seus estilos existentes
const styles = StyleSheet.create({
    // ... (seus estilos existentes)
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
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#232323',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 5, // Reduzido marginBottom
        borderWidth: 1,
        borderColor: '#EB5F1C',
    },
    // Estilo para o botão desabilitado
    disabledPickerButton: {
        backgroundColor: '#3C3C3C',
        borderColor: '#555',
    },
    pickerButtonText: {
        color: '#fff',
        fontSize: 16,
        textTransform: 'capitalize',
    },
    // Estilo para a nota de permissão
    permissionNote: {
        color: '#FFD700', // Amarelo para atenção
        fontSize: 12,
        marginBottom: 20,
        textAlign: 'center',
        alignSelf: 'stretch', // Garante que o texto ocupe a largura
    },
    pickerCenteredView: { // Alterado para TouchableOpacity
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
        width: '100%',
        marginTop: 10, // Adicionado marginTop para espaçar do aviso
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: '#4A4A4A',
        marginVertical: 20,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    deleteButtonText: {
        color: '#ff4545',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    ownerNote: { // Estilo antigo, pode ser removido ou ajustado se necessário
        color: '#FFD700',
        fontSize: 12,
        marginBottom: 20,
        textAlign: 'center'
    },
});