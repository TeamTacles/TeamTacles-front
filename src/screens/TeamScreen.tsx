import React, { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { View, StyleSheet, Alert, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from "../components/SearchBar";
import { NewItemButton } from "../components/NewItemButton";
import { EmptyState } from "../components/EmptyState";
import { TeamCard, TeamType } from "../components/TeamCard";
import { FilterModal, Filters } from "../components/FilterModal"; 
import { FilterButton } from "../components/FilterButton";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';

const mascot_isEmpty = require('../assets/polvo_bau.png');

const MOCK_TEAMS: TeamType[] = [
    {
        id: '1',
        title: 'Frontend Warriors',
        description: 'Essa equipe é fera demais no desenvolvimento de interfaces incríveis e performáticas para o usuário final.',
        members: ['CD', 'JV', 'AM', 'TS', 'LM'],
        createdAt: new Date('2025-08-15T10:00:00Z'),
    },
    {
        id: '2',
        title: 'Backend Legends',
        description: 'Responsáveis pela robustez e segurança dos nossos sistemas.',
        members: ['PR', 'SC', 'FG'],
        createdAt: new Date('2025-09-20T11:30:00Z'),
    },
    {
        id: '3',
        title: 'UX/UI Visionaries',
        description: '',
        members: ['MC', 'DA'],
        createdAt: new Date('2025-10-01T15:00:00Z'),
    }
];

type TeamScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TeamScreen = () => {
    const navigation = useNavigation<TeamScreenNavigationProp>();

    const [search, setSearch] = useState('');
    const [teams, setTeams] = useState<TeamType[]>(MOCK_TEAMS);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState<Filters>({});

    const userWithAvatar = { initials: 'CD' };

    const handleProfilePress = () => Alert.alert("Perfil Clicado!");
    const handleNotificationsPress = () => Alert.alert("Notificações Clicadas!");
    const handleNewTeam = () => Alert.alert('Nova Equipe', 'Funcionalidade em desenvolvimento.');

    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
        setFilterModalVisible(false);
    };

    const handleClearFilters = () => {
        setFilters({});
        setFilterModalVisible(false);
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
            <Header
                userProfile={userWithAvatar}
                onPressProfile={handleProfilePress}
                notificationCount={7}
                onPressNotifications={handleNotificationsPress}
            />
            <View style={styles.searchContainer}>
                <View style={styles.searchBarWrapper}>
                    <SearchBar
                        title="Suas Equipes"
                        placeholder="Pesquisar Equipes"
                        onChangeText={setSearch}
                    />
                </View>
                <FilterButton
                    style={styles.filterButtonPosition}
                    onPress={() => setFilterModalVisible(true)}
                />
            </View>

            <FlatList
                data={filteredTeams}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TeamCard
                        team={item} 
                        onPress={() => navigation.navigate('TeamDetail', { team: item })}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <EmptyState
                        imageSource={mascot_isEmpty}
                        title="Nenhuma Equipe Encontrada"
                        subtitle="Ajuste os filtros ou crie uma nova equipe."
                    />
                }
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1, 
        backgroundColor: '#191919',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingRight: 15,
    },
    searchBarWrapper: {
        flex: 1,
    },
    filterButtonPosition: {
        marginTop: 75,
    },
    listContainer: {
        flexGrow: 1,
        paddingHorizontal: 15,
        paddingBottom: 80,
    },
    addButtonContainer: {
        position: 'absolute',
        right: 25,
        bottom: 25,
    },
});