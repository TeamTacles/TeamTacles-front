import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, Share, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { InputsField } from '../../../components/common/InputsField';
import { MainButton } from '../../../components/common/MainButton';
import { TeamType, Member, TeamMemberDetail } from '../../../types/entities';
import { getInitialsFromName } from '../../../utils/stringUtils'; 
import { InfoPopup } from '../../../components/common/InfoPopup';
import NotificationPopup, { NotificationPopupRef } from '../../../components/common/NotificationPopup';
import { useAppContext } from '../../../contexts/AppContext';
import { projectService } from '../services/projectService';
import { teamService } from '../../team/services/teamService';
import { getInviteErrorMessage } from '../../../utils/errorHandler';


type ActiveTab = 'invite' | 'import';
type MemberRole = 'ADMIN' | 'MEMBER';

interface AddMembersModalProps {
  visible: boolean;
  onClose: () => void;
  onInviteByEmail: (email: string, role: MemberRole) => void;
  onImportTeam: (teamId: string) => void;
  userTeams: TeamType[];
  notificationRef?: React.RefObject<NotificationPopupRef | null>;
  projectId?: number;
  isInviting?: boolean;
  isImporting?: boolean;
  onRefreshTeams: () => void; 
  isRefreshingTeams: boolean; 
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({
    visible,
    onClose,
    onInviteByEmail,
    onImportTeam,
    userTeams,
    notificationRef,
    projectId,
    isInviting = false,
    isImporting = false,
    onRefreshTeams, 
    isRefreshingTeams, 
}) => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState<ActiveTab>('invite');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole>('MEMBER');
  const [selectedTeamSummary, setSelectedTeamSummary] = useState<TeamType | null>(null); 
  const [infoPopup, setInfoPopup] = useState({ visible: false, message: '', title: '' });
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const localNotificationRef = useRef<NotificationPopupRef>(null);
  const effectiveNotificationRef = notificationRef || localNotificationRef;
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMemberDetail[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  useEffect(() => {
    // Atualiza a lista de times quando o modal abre na aba import
    if (visible && activeTab === 'import') {
      onRefreshTeams();
    }
  }, [visible, activeTab, onRefreshTeams]);


  // Função para buscar membros detalhados quando um time é selecionado
  const handleSelectTeam = async (team: TeamType) => {
    setSelectedTeamSummary(team); 
    setIsLoadingMembers(true); 
    setSelectedTeamMembers([]); 
    try {
      const response = await teamService.getTeamMembers(team.id, 0, 20); 
      setSelectedTeamMembers(response.content); 
    } catch (error) {
      console.error("Erro ao buscar membros detalhados da equipe:", error);
      effectiveNotificationRef.current?.show({ type: 'error', message: 'Erro ao carregar membros da equipe.' });
    } finally {
      setIsLoadingMembers(false); 
    }
  };

  const handleInvite = () => {
    if (!email || !email.includes('@')) {
      setInfoPopup({ visible: true, title: "Atenção", message: "Por favor, insira um endereço de e-mail válido para continuar." });
      return;
    }
    onInviteByEmail(email, selectedRole);
    setEmail('');
  };

  const handleImport = () => {
      if (!selectedTeamSummary) return;
      onImportTeam(String(selectedTeamSummary.id));
  };

  const handleGenerateAndShareLink = async () => {
    if (!projectId) {
        effectiveNotificationRef.current?.show({ type: 'error', message: 'ID do projeto não encontrado.' });
        return;
    }
    setIsGeneratingLink(true);
    try {
      const response = await projectService.generateInviteLink(projectId); 
      const linkToShare = response.inviteLink; 
      if (linkToShare) {
        await Share.share({
          message: `Você foi convidado para um projeto! Junte-se através do link: ${linkToShare}`,
          url: linkToShare,
        });
      } else {
        throw new Error("Link não recebido da API.");
      }
    } catch (error) {
      if (!(error instanceof Error && error.message.includes('Share Canceled'))) {
        console.error("Erro ao gerar/compartilhar link do projeto:", error);
        effectiveNotificationRef.current?.show({ type: 'error', message: 'Não foi possível gerar o link de convite.' });
      }
    } finally {
      setIsGeneratingLink(false);
    }
  };


  const handleClose = () => {
      setActiveTab('invite');
      setSelectedTeamSummary(null);
      setSelectedTeamMembers([]); 
      setEmail('');
      setSelectedRole('MEMBER');
      setIsLoadingMembers(false); 
      onClose();
  }

  // Verifica se o único membro (baseado nos detalhes buscados) é o usuário atual
  const isCurrentUserOnlyDetailedMember = selectedTeamMembers.length === 1 && selectedTeamMembers[0]?.username === user?.name;

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
        disabled={isInviting || isImporting || isRefreshingTeams || isGeneratingLink}
      />
      <View style={styles.divider} />
      <Text style={styles.label}>Ou compartilhe o link de convite</Text>
      <TouchableOpacity
          style={styles.linkContainer}
          onPress={handleGenerateAndShareLink}
          disabled={isGeneratingLink || isInviting || isImporting || isRefreshingTeams}
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
    </>
  );

  const renderImportTab = () => (
    <View style={{flex: 1}}>
        {isRefreshingTeams ? ( 
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EB5F1C" />
                <Text style={styles.loadingText}>Atualizando equipes...</Text>
            </View>
        ) : !selectedTeamSummary ? ( 
             <FlatList
                data={userTeams}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.teamItem} onPress={() => handleSelectTeam(item)}>
                        <View>
                            <Text style={styles.teamTitle}>{item.title || item.name}</Text>
                            <Text style={styles.teamMemberCount}>{`${item.memberCount ?? item.members?.length ?? 0} membro(s)`}</Text>
                        </View>
                        <Icon name="chevron-forward-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
                ListHeaderComponent={<Text style={[styles.label, styles.labelSpaceSpecial]}>Selecione um time para importar:</Text>}
                ListEmptyComponent={<Text style={styles.emptyListText}>Você não faz parte de nenhuma equipe.</Text>}
            />
        ) : ( 
            <>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => { setSelectedTeamSummary(null); setSelectedTeamMembers([]); }}
                    disabled={isImporting || isRefreshingTeams || isGeneratingLink || isLoadingMembers} 
                 >
                    <Icon name="arrow-back-outline" size={20} color={(isImporting || isRefreshingTeams || isGeneratingLink || isLoadingMembers) ? "#555" : "#EB5F1C"} />
                    <Text style={[styles.backButtonText, (isImporting || isRefreshingTeams || isGeneratingLink || isLoadingMembers) && styles.disabledText]}>Voltar para a lista de times</Text>
                </TouchableOpacity>
                <Text style={styles.label}>Membros de "{selectedTeamSummary.title || selectedTeamSummary.name}":</Text>

                {isLoadingMembers ? (
                    <View style={styles.loadingContainer}>
                         <ActivityIndicator size="large" color="#EB5F1C" />
                         <Text style={styles.loadingText}>Carregando membros...</Text>
                    </View>
                ) : (
                    <FlatList
                        style={styles.memberList}
                        data={selectedTeamMembers} 
                        keyExtractor={(item) => item.userId.toString()}
                        renderItem={({item}) => (
                            <View style={styles.memberItemContainer}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberAvatarText}>{getInitialsFromName(item.username)}</Text>
                                </View>
                                <Text style={styles.memberItem}>{item.username}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyListText}>Esta equipe não possui membros.</Text>}
                    />
                )}

                <MainButton
                    title={
                        isImporting ? "Importando..." :
                        isCurrentUserOnlyDetailedMember ? "Você já está no Projeto!" :
                        `Importar ${selectedTeamMembers.length} Membro(s)`
                    }
                    onPress={handleImport}
                    style={{marginTop: 20}}
                    disabled={isImporting || isInviting || isRefreshingTeams || isCurrentUserOnlyDetailedMember || isGeneratingLink || isLoadingMembers}
                 />
            </>
        )}
    </View>
  );

  return (
    <>
      <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose} disabled={isImporting || isInviting || isRefreshingTeams || isGeneratingLink || isLoadingMembers}>
                  <Icon name="close-outline" size={30} color={(isImporting || isInviting || isRefreshingTeams || isGeneratingLink || isLoadingMembers) ? "#555" : "#fff"} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Adicionar Membros</Text>

              <View style={styles.tabContainer}>
                  <TouchableOpacity style={[styles.tabButton, activeTab === 'invite' && styles.tabButtonActive]} onPress={() => setActiveTab('invite')} disabled={isImporting || isInviting || isRefreshingTeams || isGeneratingLink || isLoadingMembers}>
                      <Text style={[styles.tabText, (isImporting || isInviting || isRefreshingTeams || isGeneratingLink || isLoadingMembers) && styles.disabledText]}>Convidar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.tabButton, activeTab === 'import' && styles.tabButtonActive]} onPress={() => setActiveTab('import')} disabled={isImporting || isInviting || isRefreshingTeams || isGeneratingLink || isLoadingMembers}>
                      <Text style={[styles.tabText, (isImporting || isInviting || isRefreshingTeams || isGeneratingLink || isLoadingMembers) && styles.disabledText]}>Importar Time</Text>
                  </TouchableOpacity>
              </View>

              <View style={{flex: 1}}>
                {activeTab === 'invite' ? renderInviteTab() : renderImportTab()}
              </View>
          </View>
          {visible && <NotificationPopup ref={effectiveNotificationRef} />}
        </View>
      </Modal>
      <InfoPopup
        visible={infoPopup.visible}
        title={infoPopup.title} 
        message={infoPopup.message}
        onClose={() => setInfoPopup({ visible: false, message: '', title: '' })} 
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
    memberList: { flex: 1, backgroundColor: '#3C3C3C', borderRadius: 8, paddingHorizontal: 10, paddingTop: 10, marginBottom: 10 }, 
    memberItemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#4A4A4A'},
    memberAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#555', justifyContent: 'center', alignItems: 'center', marginRight: 10, },
    memberAvatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, },
    memberItem: { color: '#E0E0E0', fontSize: 16 },
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButtonText: { color: '#EB5F1C', marginLeft: 8, fontSize: 16 },
    labelSpaceSpecial: { marginTop: 10},
    emptyListText: { color: '#A9A9A9', textAlign: 'center', marginTop: 20, marginBottom: 20, fontSize: 14, },
    disabledText: { color: '#888' }, 
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
    loadingText: { marginTop: 10, color: '#A9A9A9', fontSize: 14, },
});