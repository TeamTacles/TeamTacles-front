// src/features/team/screens/TeamScreen.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Header } from "../../../components/common/Header";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../../../components/common/SearchBar";
import { NewItemButton } from "../../../components/common/NewItemButton";
import { EmptyState } from "../../../components/common/EmptyState";
import { TeamCard } from "../components/TeamCard";
import { FilterModal, Filters } from "../../task/components/FilterModal";
import { FilterButton } from "../../task/components/FilterButton";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/Navigation';
import { NewTeamModal } from "../components/NewTeamModal";
import { InviteMemberModal } from "../components/InviteMemberModal";
import { InfoPopup } from "../../../components/common/InfoPopup";
import { useTeamScreen } from "../hooks/useTeamScreen";
import { useTeams } from "../hooks/useTeams";
import { useAppContext } from "../../../contexts/AppContext";

const mascot_isEmpty = require('../../../assets/polvo_bau.png');

type TeamScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TeamScreen = () => {
    const navigation = useNavigation<TeamScreenNavigationProp>();
    const { signed, user } = useAppContext(); // Pega o usuário do contexto
    const [search, setSearch] = useState('');

    const {
        teams,
        loadingTeams,
        refreshingTeams,
        hasMoreTeams,
        loadMoreTeams,
        refreshTeams,
        setTeams,
        applyFilters,
        clearFilters,
        searchByName,
    } = useTeams(signed);

    const {
        isNewTeamModalVisible,
        isInviteModalVisible,
        newlyCreatedTeam,
        isCreatingTeam,
        infoPopup,
        modalNotificationRef,
        setNewTeamModalVisible,
        setInfoPopup,
        handleCreateTeamAndProceed,
        handleCloseInviteModal,
    } = useTeamScreen();

    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    
    useFocusEffect(
      useCallback(() => {
        if (signed) {
          refreshTeams();
        }
      }, [signed, refreshTeams])
    );

    useEffect(() => {
      const handler = setTimeout(() => {
        searchByName(search);
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }, [search, searchByName]);

    const handleProfilePress = () => navigation.navigate('EditProfile'); 
    const handleNotificationsPress = () => { /* Lógica para notificações */ };
    const handleNewTeam = () => setNewTeamModalVisible(true);
    const handleApplyFilters = (newFilters: Filters) => { applyFilters(newFilters); setFilterModalVisible(false); };
    const handleClearFilters = () => { clearFilters(); setSearch(''); setFilterModalVisible(false); };
    const handleEndReached = useCallback(() => {
        if (hasMoreTeams && !loadingTeams && !refreshingTeams && teams.length > 0) {
            loadMoreTeams();
        }
    }, [hasMoreTeams, loadingTeams, refreshingTeams, teams.length, loadMoreTeams]);

    return (
        <SafeAreaView style={styles.safeAreaView} edges={['top', 'left', 'right']}>
            <Header userProfile={user} onPressProfile={handleProfilePress} notificationCount={0} onPressNotifications={handleNotificationsPress} />
            <View style={styles.searchContainer}>
                <View style={styles.searchBarWrapper}>
                    <SearchBar 
                        title="Suas Equipes" 
                        placeholder="Pesquisar por nome..." 
                        onChangeText={setSearch}
                        value={search}
                    />
                </View>
                <FilterButton style={styles.filterButtonPosition} onPress={() => setFilterModalVisible(true)} />
            </View>
            <FlatList
                data={teams}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TeamCard team={item} onPress={() => navigation.navigate('TeamDetail', { team: item })} />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    (loadingTeams || refreshingTeams) ? null : (
                        <EmptyState imageSource={mascot_isEmpty} title="Nenhuma Equipe Encontrada" subtitle="Ajuste os filtros ou crie uma nova equipe." />
                    )
                }
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                onRefresh={refreshTeams}
                refreshing={refreshingTeams}
                ListFooterComponent={() => {
                    if (loadingTeams && !refreshingTeams) {
                        return (
                            <View style={styles.loadingFooter}>
                                <ActivityIndicator size="large" color="#EB5F1C" />
                            </View>
                        );
                    }
                    return null;
                }}
            />
            <View style={styles.addButtonContainer}>
                <NewItemButton onPress={handleNewTeam} />
            </View>
            <FilterModal 
                visible={isFilterModalVisible} 
                filterType="teams" 
                onClose={() => setFilterModalVisible(false)} 
                onApply={handleApplyFilters} 
                onClear={handleClearFilters}
            />
            <NewTeamModal visible={isNewTeamModalVisible} onClose={() => setNewTeamModalVisible(false)} onNext={(data) => handleCreateTeamAndProceed(data, setTeams)} isCreating={isCreatingTeam} />
            
            <InviteMemberModal
              visible={isInviteModalVisible}
              onClose={handleCloseInviteModal}
              teamId={newlyCreatedTeam?.id || null}
              // --- INÍCIO DA CORREÇÃO: Passar a ref para o modal ---
              notificationRef={modalNotificationRef}
              // --- FIM DA CORREÇÃO ---
            />

            <InfoPopup visible={infoPopup.visible} title={infoPopup.title} message={infoPopup.message} onClose={() => setInfoPopup({ visible: false, title: '', message: '' })} />
        </SafeAreaView>
    );
};
// ESTILOS CONTINUAM OS MESMOS
const styles = StyleSheet.create({
    safeAreaView: { flex: 1, backgroundColor: '#191919' },
    searchContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: 15 },
    searchBarWrapper: { flex: 1 },
    filterButtonPosition: { marginTop: 75 },
    listContainer: { flexGrow: 1, paddingHorizontal: 15, paddingBottom: 80 },
    addButtonContainer: { position: 'absolute', right: 25, bottom: 25 },
    loadingFooter: { padding: 20, alignItems: 'center' },
});

export default TeamScreen;