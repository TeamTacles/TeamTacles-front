import React, { useState, useMemo, useRef } from "react";
import { Header } from "../../../components/common/Header";
import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../../../components/common/SearchBar";
import { NewItemButton } from "../../../components/common/NewItemButton";
import { EmptyState } from "../../../components/common/EmptyState";
import { TeamCard } from "../components/TeamCard";
import { FilterModal, Filters } from "../../task/components/FilterModal";
import { FilterButton } from "../../task/components/FilterButton";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import { NewTeamModal } from "../components/NewTeamModal";
import { InviteMemberModal } from "../components/InviteMemberModal";
import NotificationPopup from '../../../components/common/NotificationPopup';
import { InfoPopup } from "../../../components/common/InfoPopup";
import { TeamType } from '../../../types/entities';
import { MOCK_TEAMS } from '../../../data/mocks';
import { useTeamScreen } from "../hooks/useTeamScreen";

const mascot_isEmpty = require('../../../assets/polvo_bau.png');

type TeamScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type MemberRole = 'ADMIN' | 'MEMBER';

export const TeamScreen = () => {
    const navigation = useNavigation<TeamScreenNavigationProp>();

    // Hook customizado que gerencia a lógica da tela de times
    const {
        isNewTeamModalVisible,
        isInviteModalVisible,
        newlyCreatedTeam,
        isCreatingTeam,
        infoPopup,
        userWithAvatar,
        notificationRef,
        setNewTeamModalVisible,
        setInfoPopup,
        handleCreateTeamAndProceed,
        handleInviteByEmail,
        handleCloseInviteModal,
    } = useTeamScreen();

    const [search, setSearch] = useState('');
    const [teams, setTeams] = useState<TeamType[]>(MOCK_TEAMS);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState<Filters>({});

    const handleProfilePress = () => navigation.navigate('EditProfile');
    const handleNotificationsPress = () => { /* Lógica para notificações */ };
    const handleNewTeam = () => setNewTeamModalVisible(true);
    const handleApplyFilters = (newFilters: Filters) => { setFilters(newFilters); setFilterModalVisible(false); };
    const handleClearFilters = () => { setFilters({}); setFilterModalVisible(false); };

    const filteredTeams = useMemo(() => {
        return teams
            .filter(team => team.title?.toLowerCase().includes(search.toLowerCase()))
            .filter(team => {
                const teamDate = typeof team.createdAt === 'number'
                    ? new Date(team.createdAt)
                    : team.createdAt;
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
                keyExtractor={(item) => item.id.toString()}
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
            <NewTeamModal visible={isNewTeamModalVisible} onClose={() => setNewTeamModalVisible(false)} onNext={(data) => handleCreateTeamAndProceed(data, setTeams)} isCreating={isCreatingTeam} />
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