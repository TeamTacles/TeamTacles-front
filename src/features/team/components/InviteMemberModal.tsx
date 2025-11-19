import React, { useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';

import { InputsField } from '../../../components/common/InputsField';
import { MainButton } from '../../../components/common/MainButton';
import { InfoPopup } from '../../../components/common/InfoPopup';
import { teamService } from '../services/teamService';
import { projectService } from '../../project/services/projectService'; 
import { getInviteErrorMessage } from '../../../utils/errorHandler';
import NotificationPopup, { NotificationPopupRef } from '../../../components/common/NotificationPopup';

type MemberRole = 'ADMIN' | 'MEMBER';

interface InviteMemberModalProps {
  visible: boolean;
  teamId?: number | string | null;
  projectId?: number | string | null; 
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
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

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

  const handleLoadToken = async () => {
    if (!resourceId) {
        effectiveNotificationRef.current?.show({ type: 'error', message: `ID não encontrado.` });
        return;
    }

    setIsGeneratingLink(true);
    try {
      let token = ''; 

      if (resourceType === 'project') {
        const response = await projectService.generateInviteLink(Number(resourceId));
        token = response.inviteToken; 
      } else if (resourceType === 'team') {
        const response = await teamService.generateInviteLink(resourceId);
        token = response.inviteToken; 
      }

      if (token) {
        setGeneratedToken(token);
      } else {
        throw new Error("Token vazio recebido da API");
      }
    } catch (error) {
        effectiveNotificationRef.current?.show({ type: 'error', message: 'Não foi possível carregar o código.' });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyToken = async () => {
    if (generatedToken) {
      await Clipboard.setStringAsync(generatedToken);
      effectiveNotificationRef.current?.show({ type: 'success', message: 'Código copiado!' });
    }
  };

  const handleClose = () => {
      setEmail('');
      setSelectedRole('MEMBER');
      setGeneratedToken(null); // Limpa o token ao fechar
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

            <Text style={styles.label}>Ou compartilhe o código de acesso</Text>
            
            {!generatedToken ? (
                <TouchableOpacity
                  style={styles.linkContainer}
                  onPress={handleLoadToken}
                  disabled={isGeneratingLink || isInviting} 
                >
                    {isGeneratingLink ? (
                      <ActivityIndicator color="#EB5F1C" />
                    ) : (
                      <>
                        <Text style={styles.linkText}>Gerar Código de Convite</Text>
                        <Icon name="key-outline" size={18} color="#EB5F1C" />
                      </>
                    )}
                </TouchableOpacity>
            ) : (
                <View style={styles.tokenDisplayContainer}>
                    <View style={{flex: 1}}>
                        <Text style={styles.tokenLabel}>Código do {resourceType === 'project' ? 'Projeto' : 'Time'}:</Text>
                        <Text style={styles.tokenValue} selectable>{generatedToken}</Text>
                    </View>
                    
                    <TouchableOpacity style={styles.copyButton} onPress={handleCopyToken}>
                        <Icon name="copy-outline" size={18} color="#fff" />
                        <Text style={styles.copyButtonText}>Copiar</Text>
                    </TouchableOpacity>
                </View>
            )}

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
        paddingVertical: 10,
        paddingHorizontal: 12,
        minHeight: 44,
    },
    linkText: {
        color: '#A9A9A9',
        fontSize: 13,
        flex: 1, 
        marginRight: 8, 
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
    tokenDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3C3C3C',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#555',
    },
    tokenLabel: {
        color: '#A9A9A9',
        fontSize: 11,
        marginBottom: 4,
    },
    tokenValue: {
        color: '#EB5F1C',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        fontFamily: 'monospace',
        flexWrap: 'wrap',
    },
    copyButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: '#555',
        marginLeft: 8,
        minWidth: 50,
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 9,
        marginTop: 2,
    },
});