import React, { useState, useMemo, useRef } from "react";
import { Header } from "../components/Header";
import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../components/SearchBar";
import { NewItemButton } from "../components/NewItemButton";
import { EmptyState } from "../components/EmptyState";
import { TeamCard, TeamType, Member } from "../components/TeamCard";
import { FilterModal, Filters } from "../components/FilterModal";
import { FilterButton } from "../components/FilterButton";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import { NewTeamModal } from "../components/NewTeamModal";
import { InviteMemberModal } from "../components/InviteMemberModal";
import NotificationPopup, { NotificationPopupRef } from '../components/NotificationPopup';
import { InfoPopup } from "../components/InfoPopup";

const mascot_isEmpty = require('../assets/polvo_bau.png');

const MOCK_TEAMS: TeamType[] = [
    {
        id: '1',
        title: 'Frontend Warriors',
        description: 'Essa equipe é fera demais no desenvolvimento de interfaces incríveis e performáticas para o usuário final.',
        members: [
            { name: 'Caio Dib', initials: 'CD' },
            { name: 'João Victor', initials: 'JV' },
            { name: 'Ana Mello', initials: 'AM' },
            { name: 'Túlio Santos', initials: 'TS' },
            { name: 'Luana Marques', initials: 'LM' }
        ],
        createdAt: new Date('2025-08-15T10:00:00Z'),
    },
    {
        id: '2',
        title: 'Backend Legends',
        description: 'Responsáveis pela robustez e segurança dos nossos sistemas.',
        members: [
            { name: 'Pedro Ramos', initials: 'PR' },
            { name: 'Sofia Costa', initials: 'SC' },
            { name: 'Felipe Garcia', initials: 'FG' }
        ],
        createdAt: new Date('2025-09-20T11:30:00Z'),
    },
    {
        id: '3',
        title: 'UX/UI Visionaries',
        description: '',
        members: [
            { name: 'Mariana Costa', initials: 'MC' },
            { name: 'Daniel Almeida', initials: 'DA' }
        ],
        createdAt: new Date('2025-10-01T15:00:00Z'),
    }
];

type TeamScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type MemberRole = 'ADMIN' | 'MEMBER';

export const TeamScreen = () => {
    const navigation = useNavigation<TeamScreenNavigationProp>();
    const notificationRef = useRef<NotificationPopupRef>(null);
    const [infoPopup, setInfoPopup] = useState({ visible: false, title: '', message: '' });
    const [search, setSearch] = useState('');
    const [teams, setTeams] = useState<TeamType[]>(MOCK_TEAMS);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState<Filters>({});
    const [isNewTeamModalVisible, setNewTeamModalVisible] = useState(false);
    const [isInviteModalVisible, setInviteModalVisible] = useState(false);
    const [newlyCreatedTeam, setNewlyCreatedTeam] = useState<TeamType | null>(null);
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);

    const userWithAvatar = { initials: 'CD', name: 'Caio Dib' };

    const handleProfilePress = () => navigation.navigate('EditProfile');
    const handleNotificationsPress = () => { /* Lógica para notificações */ };
    const handleNewTeam = () => setNewTeamModalVisible(true);
    const handleApplyFilters = (newFilters: Filters) => { setFilters(newFilters); setFilterModalVisible(false); };
    const handleClearFilters = () => { setFilters({}); setFilterModalVisible(false); };

    const handleCreateTeamAndProceed = async (data: { title: string; description: string }) => {
        if (!data.title.trim()) {
            setInfoPopup({ visible: true, title: 'Atenção', message: 'O título da equipe é obrigatório.' });
            return;
        }

        setIsCreatingTeam(true);
        try {
            console.log("Simulando chamada à API para criar a equipe:", data);
            const responseSimulada = { id: new Date().getTime(), name: data.title, description: data.description };

            const newTeam: TeamType = {
                id: responseSimulada.id.toString(),
                title: responseSimulada.name,
                description: responseSimulada.description,
                members: [{ name: userWithAvatar.name, initials: userWithAvatar.initials }],
                createdAt: new Date(),
            };

            setTeams(currentTeams => [newTeam, ...currentTeams]);
            setNewlyCreatedTeam(newTeam);
            setNewTeamModalVisible(false);
            setInviteModalVisible(true);
        } catch (error) {
            setInfoPopup({ visible: true, title: 'Erro na Criação', message: 'Não foi possível criar a equipe. Por favor, tente novamente mais tarde.' });
        } finally {
            setIsCreatingTeam(false);
        }
    };

    const handleInviteByEmail = (email: string, role: MemberRole) => {
        if (!newlyCreatedTeam) return;
        console.log(`Simulando convite para ${email} na equipe ID ${newlyCreatedTeam.id} com cargo ${role}`);
        notificationRef.current?.show({ type: 'success', message: `Convite enviado para ${email}!` });
    };

    const handleCloseInviteModal = () => {
        setInviteModalVisible(false);
        if (newlyCreatedTeam) {
            notificationRef.current?.show({ type: 'success', message: `Equipe "${newlyCreatedTeam.title}" criada com sucesso!` });
            setNewlyCreatedTeam(null);
        }
    };

    const filteredTeams = useMemo(() => {
        return teams
            .filter(team => team.title.toLowerCase().includes(search.toLowerCase()))
            .filter(team => {
                const teamDate = team.createdAt;
                const { createdAtAfter, createdAtBefore } = filters;
                if (createdAtAfter && teamDate.setHours(0,0,0,0) < createdAtAfter.setHours(0,0,0,0)) return false;
                if (createdAtBefore && teamDate.setHours(0,0,0,0) > createdAtBefore.setHours(0,0,0,0)) return false;
                return true;
            });
    }, [search, teams, filters]);

    return (
        <SafeAreaView style={styles.safeAreaView} edges={['top', 'left', 'right']}>
            <Header userProfile={userWithAvatar} onPressProfile={handleProfilePress} notificationCount={7} onPressNotifications={handleNotificationsPress} />
            <View style={styles.searchContainer}>
                <View style={styles.searchBarWrapper}>
                    <SearchBar title="Suas Equipes" placeholder="Pesquisar Equipes" onChangeText={setSearch} />
                </View>
                <FilterButton style={styles.filterButtonPosition} onPress={() => setFilterModalVisible(true)} />
            </View>
            <FlatList
                data={filteredTeams}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TeamCard team={item} onPress={() => navigation.navigate('TeamDetail', { team: item })} />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<EmptyState imageSource={mascot_isEmpty} title="Nenhuma Equipe Encontrada" subtitle="Ajuste os filtros ou crie uma nova equipe." />}
            />
            <View style={styles.addButtonContainer}>
                <NewItemButton onPress={handleNewTeam} />
            </View>
            <FilterModal visible={isFilterModalVisible} filterType="teams" onClose={() => setFilterModalVisible(false)} onApply={handleApplyFilters} onClear={handleClearFilters} />
            <NewTeamModal visible={isNewTeamModalVisible} onClose={() => setNewTeamModalVisible(false)} onNext={handleCreateTeamAndProceed} isCreating={isCreatingTeam} />
            <InviteMemberModal visible={isInviteModalVisible} onClose={handleCloseInviteModal} onInviteByEmail={handleInviteByEmail} inviteLink={newlyCreatedTeam ? `https://teamtacles.com/join/${newlyCreatedTeam.id}` : null} />
            <NotificationPopup ref={notificationRef} />
            <InfoPopup visible={infoPopup.visible} title={infoPopup.title} message={infoPopup.message} onClose={() => setInfoPopup({ visible: false, title: '', message: '' })} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeAreaView: { flex: 1, backgroundColor: '#191919' },
    searchContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: 15 },
    searchBarWrapper: { flex: 1 },
    filterButtonPosition: { marginTop: 75 },
    listContainer: { flexGrow: 1, paddingHorizontal: 15, paddingBottom: 80 },
    addButtonContainer: { position: 'absolute', right: 25, bottom: 25 },
});