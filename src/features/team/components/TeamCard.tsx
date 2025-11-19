import React from "react";
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BaseCard } from "../../../components/common/BaseCard";
import Icon from 'react-native-vector-icons/Ionicons';
import { TeamType } from '../../../types/entities';

interface TeamCardProps {
    team: TeamType;
    onPress: () => void;
}

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
};

export const TeamCard = ({ team, onPress }: TeamCardProps) => {
    const { title, description, members, memberCount } = team;
    const teamTitle = title || (team as any).name || '';

    return (
        <BaseCard onPress={onPress}>
            <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{teamTitle}</Text>
                    {description ? (
                        <Text style={styles.description}>
                            {truncateText(description, 50)}
                        </Text>
                    ) : null}
                </View>

                <View style={styles.footer}>
                    <View style={styles.memberInfo}>
                        <Icon name="people-outline" size={16} color="#A9A9A9" />
                        <Text style={styles.memberText}>{`${memberCount} participante${memberCount !== 1 ? 's' : ''}`}</Text>
                    </View>
                    <View style={styles.teamContainer}>
                        {members.slice(0, 4).map((member, index) => (
                            <View key={index} style={[styles.avatar, { marginLeft: index > 0 ? -10 : 0 }]}>
                                <Text style={styles.avatarText}>{member.initials}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </BaseCard>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 15,
    },
    textContainer: {
        marginBottom: 20,
    },
    title: {
        color: '#EB5F1C',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    description: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberText: {
        color: '#A9A9A9',
        fontSize: 12,
        marginLeft: 6,
    },
    teamContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2A2A2A',
        zIndex: 1,
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
});