// src/components/AddMembersModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Share } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { InputsField } from '../../../components/common/InputsField';
import { MainButton } from '../../../components/common/MainButton';
import { TeamType, Member } from '../../../types/entities';
import { InfoPopup } from '../../../components/common/InfoPopup';
import NotificationPopup, { NotificationPopupRef } from '../../../components/common/NotificationPopup';

type ActiveTab = 'invite' | 'import';
type MemberRole = 'ADMIN' | 'MEMBER';

interface AddMembersModalProps {
  visible: boolean;
  onClose: () => void;
  onInviteByEmail: (email: string, role: MemberRole) => void;
  onImportTeam: (teamId: string) => void;
  userTeams: TeamType[];
  inviteLink: string | null;
  notificationRef?: React.RefObject<NotificationPopupRef | null>;
  projectId?: number; // ID do projeto para chamadas à API
  isInviting?: boolean; // Estado de loading durante o convite
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({ visible, onClose, onInviteByEmail, onImportTeam, userTeams, inviteLink, notificationRef, projectId, isInviting = false }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('invite');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole>('MEMBER');
  const [selectedTeam, setSelectedTeam] = useState<TeamType | null>(null);
  const [infoPopup, setInfoPopup] = useState({ visible: false, message: '' });

  const handleInvite = () => {
    if (!email || !email.includes('@')) {
      setInfoPopup({ visible: true, message: "Por favor, insira um endereço de e-mail válido para continuar." });
      return;
    }
    onInviteByEmail(email, selectedRole);
    setEmail('');
    // Modal permanece aberto para permitir múltiplos convites
  };
  
  const handleImport = () => {
      if (!selectedTeam) return;
      onImportTeam(selectedTeam.id.toString());
      setSelectedTeam(null);
      onClose(); // <-- ALTERAÇÃO: Fecha o modal após a importação
  };

  const onShareLink = async () => {
    if (!inviteLink) return;
    try {
      await Share.share({
        message: `Você foi convidado para um projeto! Junte-se através do link: ${inviteLink}`,
        url: inviteLink,
      });
    } catch (error) {
      // Silenciosamente falha - erro de compartilhamento não precisa notificar
    }
  };

  const handleClose = () => {
      setActiveTab('invite');
      setSelectedTeam(null);
      setEmail('');
      onClose();
  }

  const renderInviteTab = () => (
    <>
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
          <TouchableOpacity style={[styles.roleButton, selectedRole === 'MEMBER' && styles.roleButtonSelected]} onPress={() => setSelectedRole('MEMBER')}>
            <Text style={styles.roleButtonText}>Membro</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleButton, selectedRole === 'ADMIN' && styles.roleButtonSelected]} onPress={() => setSelectedRole('ADMIN')}>
            <Text style={styles.roleButtonText}>Administrador</Text>
          </TouchableOpacity>
      </View>
      <MainButton
        title={isInviting ? "Enviando..." : "Enviar Convite"}
        onPress={handleInvite}
        disabled={isInviting}
      />
      <View style={styles.divider} />
      <Text style={styles.label}>Ou compartilhe o link de convite</Text>
      <TouchableOpacity style={styles.linkContainer} onPress={onShareLink} disabled={!inviteLink}>
          <Text style={styles.linkText} numberOfLines={1}>{inviteLink || 'Gerando link...'}</Text>
          <Icon name="share-social-outline" size={24} color="#EB5F1C" />
      </TouchableOpacity>
    </>
  );

  const renderImportTab = () => (
    <View style={{flex: 1}}>
        {!selectedTeam ? (
             <FlatList
                data={userTeams}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.teamItem} onPress={() => setSelectedTeam(item)}>
                        <View>
                            <Text style={styles.teamTitle}>{item.title}</Text>
                            <Text style={styles.teamMemberCount}>{item.members.length} membro(s)</Text>
                        </View>
                        <Icon name="chevron-forward-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
                ListHeaderComponent={<Text style={[styles.label, styles.labelSpaceSpecial]}>Selecione um time para importar:</Text>}
            />
        ) : (
            <>
                <TouchableOpacity style={styles.backButton} onPress={() => setSelectedTeam(null)}>
                    <Icon name="arrow-back-outline" size={20} color="#EB5F1C" />
                    <Text style={styles.backButtonText}>Voltar para a lista de times</Text>
                </TouchableOpacity>
                <Text style={styles.label}>Membros de "{selectedTeam.title}":</Text>
                <FlatList
                    style={styles.memberList}
                    data={selectedTeam.members}
                    keyExtractor={(item) => item.name}
                    renderItem={({item}) => (
                        <View style={styles.memberItemContainer}>
                            <Icon name="person-circle-outline" size={22} color="#A9A9A9" />
                            <Text style={styles.memberItem}>{item.name}</Text>
                        </View>
                    )}
                />
                <MainButton title={`Importar ${selectedTeam.members.length} Membros`} onPress={handleImport} style={{marginTop: 20}}/>
            </>
        )}
    </View>
  );

  return (
    <>
      <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Icon name="close-outline" size={30} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Adicionar Membros</Text>

              <View style={styles.tabContainer}>
                  <TouchableOpacity style={[styles.tabButton, activeTab === 'invite' && styles.tabButtonActive]} onPress={() => setActiveTab('invite')}>
                      <Text style={styles.tabText}>Convidar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.tabButton, activeTab === 'import' && styles.tabButtonActive]} onPress={() => setActiveTab('import')}>
                      <Text style={styles.tabText}>Importar Time</Text>
                  </TouchableOpacity>
              </View>

              <View style={{flex: 1}}>
                {activeTab === 'invite' ? renderInviteTab() : renderImportTab()}
              </View>
          </View>
          {/* Renderiza NotificationPopup SOMENTE quando o modal está visível e a ref foi passada */}
          {visible && notificationRef && <NotificationPopup ref={notificationRef} />}
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
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
    modalView: { height: '80%', width: '90%', backgroundColor: '#2A2A2A', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    closeButton: { position: 'absolute', top: 10, right: 10, padding: 5, zIndex: 1 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
    tabContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#3C3C3C', borderRadius: 10, padding: 4},
    tabButton: { flex: 1, paddingVertical: 10, borderRadius: 8 },
    tabButtonActive: { backgroundColor: '#555' },
    tabText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
    label: { fontSize: 16, color: '#E0E0E0', alignSelf: 'flex-start', marginBottom: 15, },
    roleSelectorContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, },
    roleButton: { backgroundColor: '#555', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
    roleButtonSelected: { backgroundColor: '#EB5F1C' },
    roleButtonText: { color: '#fff', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#4A4A4A', marginVertical: 25 },
    linkContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#3C3C3C', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 15 },
    linkText: { color: '#A9A9A9', fontSize: 14, flex: 1, marginRight: 10 },
    teamItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#3C3C3C', borderRadius: 8, marginBottom: 10 },
    teamTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    teamMemberCount: { color: '#A9A9A9', fontSize: 12 },
    memberList: { flex: 1, backgroundColor: '#3C3C3C', borderRadius: 8, padding: 10 },
    memberItemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#4A4A4A'},
    memberItem: { color: '#E0E0E0', fontSize: 16, marginLeft: 10 },
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButtonText: { color: '#EB5F1C', marginLeft: 8, fontSize: 16 },
    labelSpaceSpecial: { marginTop: 20}
});