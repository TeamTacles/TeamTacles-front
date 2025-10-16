import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity,StatusBar,ImageSourcePropType  } from 'react-native';

// Informações do usuário. Caso a imagem não esteja disponível, as iniciais do nome serão exibidas no lugar.
interface UserProfile {
    avatarSource?: ImageSourcePropType;
    initials: string;
}

// Informações do Header, possuindo uma função para caso clicar no ícone seja pressionado. De forma similar, uma função para caso o ícone de notificação seja apertado, além de um atributo para indicar as notificações que restam a serem lidas
interface HeaderProps {
    userProfile: UserProfile;
    onPressProfile: () => void;
    notificationCount: number;
    onPressNotifications: () => void;
}

const logo = require('../../assets/logoHeader.png');
const notificationIcon = require('../../assets/notificationIcon.png');

export const Header = ({ userProfile, onPressProfile, notificationCount = 0, onPressNotifications }: HeaderProps) => {

  return (
    <View style={styles.container}>
        {/*Personalizando o fundo da barra de notificação.*/}
        <StatusBar
            translucent={true}            
            barStyle="light-content" 
        />
        <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.title}>TeamTacles</Text>
        </View>
        <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={onPressNotifications} style={styles.actionButton}>
                <Image source={ notificationIcon } style={styles.icon} />
                {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
                </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressProfile} style={styles.actionButton}>
                {userProfile.avatarSource ? (
                    <Image source={userProfile.avatarSource} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.initialsContainer]}>
                        <Text style={styles.initialsText}>{userProfile.initials}</Text>
                    </View>
                )}            
              </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#232323', 
    width: '100%',
    height: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 22,
    height: 30,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 16,
    position: 'relative',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF', 
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16, 
  },
  initialsContainer: {
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});