import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { InputsField } from './InputsField';
import { MainButton } from './MainButton';
import { InfoPopup } from './InfoPopup'; // Importe o InfoPopup

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

  // Estados para controlar o nosso popup de erro customizado
  const [infoPopupVisible, setInfoPopupVisible] = useState(false);
  const [infoPopupMessage, setInfoPopupMessage] = useState('');

  const handleInvite = () => {
    // Validação do e-mail
    if (!email || !email.includes('@')) {
      setInfoPopupMessage("Por favor, insira um endereço de e-mail válido para continuar.");
      setInfoPopupVisible(true);
      return; // Para a execução aqui
    }
    // Se o e-mail for válido, chama a função de sucesso
    onInviteByEmail(email, selectedRole);
    setEmail(''); // Limpa o campo
  };

  const onShareLink = async () => {
    // ... (código de compartilhamento sem alterações)
  };

  return (
    <>
      <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* ... (resto do JSX do modal sem alterações) */}
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

      {/* Renderiza o InfoPopup para mensagens de erro */}
      <InfoPopup
        visible={infoPopupVisible}
        title="⚠️ Atenção"
        message={infoPopupMessage}
        onClose={() => setInfoPopupVisible(false)}
      />
    </>
  );
};

// Estilos (sem alterações, mantidos para referência)
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