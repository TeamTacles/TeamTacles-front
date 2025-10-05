import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { InputsField } from './InputsField';
import { MainButton } from './MainButton';

type MemberRole = 'ADMIN' | 'MEMBER';

interface InviteMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onInviteByEmail: (email: string, role: MemberRole) => void;
  inviteLink: string | null;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ visible, onClose, onInviteByEmail, inviteLink }) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole>('MEMBER');

  const handleInvite = () => {
    if (!email || !email.includes('@')) {
      Alert.alert("E-mail Inválido", "Por favor, insira um endereço de e-mail válido.");
      return;
    }
    onInviteByEmail(email, selectedRole);
    setEmail(''); // Limpa o campo após o envio
  };

  const onShareLink = async () => {
    if (!inviteLink) {
        Alert.alert("Aguarde", "O link de convite ainda está sendo gerado.");
        return;
    }
    try {
      await Share.share({
        message: `Você foi convidado para participar da nossa equipe! Junte-se a nós através deste link: ${inviteLink}`,
        title: 'Convite para Equipe TeamTacles'
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close-outline" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Convidar Membros</Text>

          <InputsField
            label="Convidar por E-mail"
            placeholder="Digite o e-mail do novo membro"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>Cargo:</Text>
          <View style={styles.roleSelectorContainer}>
            <TouchableOpacity 
              style={[styles.roleButton, selectedRole === 'MEMBER' && styles.roleButtonSelected]} 
              onPress={() => setSelectedRole('MEMBER')}
            >
              <Text style={styles.roleButtonText}>Membro</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, selectedRole === 'ADMIN' && styles.roleButtonSelected]}
              onPress={() => setSelectedRole('ADMIN')}
            >
               <Text style={styles.roleButtonText}>Administrador</Text>
            </TouchableOpacity>
          </View>
          
          <MainButton title="Enviar Convite" onPress={handleInvite} />

          <View style={styles.divider} />

          <Text style={styles.label}>Ou compartilhe o link de convite</Text>
          <TouchableOpacity style={styles.linkContainer} onPress={onShareLink} disabled={!inviteLink}>
            <Text style={styles.linkText} numberOfLines={1}>{inviteLink || 'Gerando link...'}</Text>
            <Icon name="share-social-outline" size={24} color="#EB5F1C" />
          </TouchableOpacity>
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
        backgroundColor: '#2A2A2A', 
        borderRadius: 20, 
        padding: 25, 
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
    modalTitle: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#FFFFFF', 
        marginBottom: 20, 
        textAlign: 'center' 
    },
    divider: {
        height: 1,
        backgroundColor: '#4A4A4A',
        marginVertical: 25,
    },
    label: {
        fontSize: 16,
        color: '#E0E0E0',
        alignSelf: 'flex-start',
        marginBottom: 10,
        marginTop: 15,
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3C3C3C',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    linkText: {
        color: '#A9A9A9',
        fontSize: 14,
        flex: 1,
        marginRight: 10,
    },
    roleSelectorContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    roleButton: {
      backgroundColor: '#555',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
    },
    roleButtonSelected: {
      backgroundColor: '#EB5F1C',
    },
    roleButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
});