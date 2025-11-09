import React, { useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { InputsField } from '../../../components/common/InputsField';
import { MainButton } from '../../../components/common/MainButton';
import { InfoPopup } from '../../../components/common/InfoPopup';
import { teamService } from '../services/teamService'; // Mantido para convite de time
import { projectService } from '../../project/services/projectService'; // Importado para convite de projeto
import { getInviteErrorMessage } from '../../../utils/errorHandler';
import NotificationPopup, { NotificationPopupRef } from '../../../components/common/NotificationPopup';

type MemberRole = 'ADMIN' | 'MEMBER';

interface InviteMemberModalProps {
  visible: boolean;
  teamId?: number | string | null;
  projectId?: number | string | null; // Adicionado projectId
  onClose: () => void;
  notificationRef?: React.RefObject<NotificationPopupRef | null>;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
    visible,
    teamId,
    projectId, 
    onClose,
    notificationRef
}) => {
  const localNotificationRef = useRef<NotificationPopupRef>(null);
  const effectiveNotificationRef = notificationRef || localNotificationRef;

  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole>('MEMBER');
  const [infoPopup, setInfoPopup] = useState({ visible: false, message: '' });

  const [isInviting, setIsInviting] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const resourceType = projectId ? 'project' : 'team';
  const resourceId = projectId || teamId;

  const handleInviteByEmail = async () => {
    if (!email.includes('@')) {
      setInfoPopup({ visible: true, message: "Por favor, insira um e-mail válido." });
      return;
    }
    if (!resourceId) return;

    setIsInviting(true);
    try {
      if (resourceType === 'project') {
        await projectService.inviteUserByEmail(Number(resourceId), { email, role: selectedRole });
      } else if (resourceType === 'team') {
        await teamService.inviteUserByEmail(resourceId, { email, role: selectedRole });
      }
      effectiveNotificationRef.current?.show({ type: 'success', message: `Convite enviado para ${email}!` });
      setEmail('');
    } catch (error) {
      effectiveNotificationRef.current?.show({ type: 'error', message: getInviteErrorMessage(error) });
    } finally {
      setIsInviting(false);
    }
  };

  const handleGenerateAndShareLink = async () => {
    if (!resourceId) {
        effectiveNotificationRef.current?.show({ type: 'error', message: `ID do ${resourceType === 'project' ? 'projeto' : 'time'} não encontrado.` });
        return;
    }

    setIsGeneratingLink(true);
    try {
      let linkToShare = '';
      let entityName = resourceType === 'project' ? 'projeto' : 'time'; 

      if (resourceType === 'project') {
        const response = await projectService.generateInviteLink(Number(resourceId));
        linkToShare = response.inviteLink;
      } else if (resourceType === 'team') {
        const response = await teamService.generateInviteLink(resourceId);
        linkToShare = response.inviteLink;
      }

      if (linkToShare) {
        await Share.share({
          message: `Você foi convidado para um ${entityName}! Junte-se através do link: ${linkToShare}`,
          url: linkToShare, 
        });
      } else {
        throw new Error("Link não recebido da API.");
      }
    } catch (error) {
      if (!(error instanceof Error && error.message.includes('Share Canceled'))) {
        console.error(`Erro ao gerar/compartilhar link do ${resourceType}:`, error);
        effectiveNotificationRef.current?.show({ type: 'error', message: 'Não foi possível gerar o link de convite.' });
      }
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleClose = () => {
      setEmail('');
      setSelectedRole('MEMBER');
      onClose();
  }

  return (
    <>
      <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
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

            <MainButton
              title={isInviting ? "Enviando..." : "Enviar Convite"}
              onPress={handleInviteByEmail}
              disabled={isInviting || isGeneratingLink} 
            />

            <View style={styles.divider} />

            <Text style={styles.label}>Ou compartilhe o link de convite</Text>
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={handleGenerateAndShareLink}
              disabled={isGeneratingLink || isInviting} 
            >
                {isGeneratingLink ? (
                  <ActivityIndicator color="#EB5F1C" />
                ) : (
                  <>
                    <Text style={styles.linkText} numberOfLines={1}>Gerar e compartilhar link</Text>
                    <Icon name="share-social-outline" size={24} color="#EB5F1C" />
                  </>
                )}
            </TouchableOpacity>
          </View>
          {visible && <NotificationPopup ref={effectiveNotificationRef} />}
        </View>
      </Modal>

      <InfoPopup
        visible={infoPopup.visible}
        title="⚠️ Atenção"
        message={infoPopup.message}
        onClose={() => setInfoPopup({ visible: false, message: '' })}
      />
    </>
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