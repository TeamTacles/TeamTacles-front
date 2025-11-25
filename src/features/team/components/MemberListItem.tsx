import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getInitialsFromName } from '../../../utils/stringUtils';

interface MemberListItemProps {
  name: string;
  role: string;
  onPress: () => void;
  disabled?: boolean; 
}

const getRoleIcon = (role: string) => {
    switch (role) {
        case 'OWNER':
            return 'shield-checkmark';
        case 'ADMIN':
            return 'build';
        default:
            return 'person';
    }
};

const roleTranslations: { [key: string]: string } = {
    OWNER: 'Dono',
    ADMIN: 'Administrador',
    MEMBER: 'Membro',
};

export const MemberListItem: React.FC<MemberListItemProps> = ({ name, role, onPress, disabled }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, disabled && styles.disabledContainer]} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.avatar}><Text style={styles.avatarText}>{getInitialsFromName(name)}</Text></View>
      <View style={styles.memberInfo}><Text style={styles.name}>{name}</Text><Text style={styles.role}>{roleTranslations[role] || role}</Text></View>
      <Icon name={getRoleIcon(role)} size={24} color="#A9A9A9" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberInfo: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  role: {
    color: '#A9A9A9',
    fontSize: 14,
    textTransform: 'capitalize',
  },
});