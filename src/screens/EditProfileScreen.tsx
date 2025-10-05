import React, { useState, useRef } from 'react'; // <<< ALTERAÇÃO: Adicionado useRef
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FormCard } from '../components/FormCard';
import { InputsField } from '../components/InputsField';
import { MainButton } from '../components/MainButton';
import NotificationPopup, { NotificationPopupRef } from '../components/NotificationPopup';

export const EditProfileScreen = () => {
    const navigation = useNavigation();

    const notificationRef = useRef<NotificationPopupRef>(null);

    const [name, setName] = useState('Caio Dib');
    const [email, setEmail] = useState('caio.dib@example.com');

    const handleSaveChanges = () => {
        try {
            if (name.length < 3) {
                throw new Error("O nome deve ter pelo menos 3 caracteres.");
            }

            notificationRef.current?.show({
                type: 'success',
                message: 'As suas informações foram atualizadas!',
            });

            setTimeout(() => {
                navigation.goBack();
            }, 1500);

        } catch (error: any) {
            notificationRef.current?.show({
                type: 'error',
                message: error.message || "Não foi possível salvar as alterações.",
            });
        }
    };
    
    const handleChangePassword = () => {
        Alert.alert("Trocar Senha", "Funcionalidade em desenvolvimento.");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back-outline" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <FormCard>
                    <InputsField
                        label="Nome"
                        placeholder="Digite seu nome completo"
                        value={name}
                        onChangeText={setName}
                    />
                    <InputsField
                        label="Email"
                        value={email}
                        editable={false} 
                        style={styles.inputDisabled}
                    />
                    <View style={styles.button}>
                        <MainButton title="Salvar Alterações" onPress={handleSaveChanges} />
                    </View>
                </FormCard>
                <View style={styles.passwordSection}>
                    <Text style={styles.sectionTitle}>Segurança</Text>
                    <View style={styles.passwordButton}>
                        <MainButton title="Trocar Senha" onPress={handleChangePassword} />
                    </View>
                </View>
            </ScrollView>
            <NotificationPopup ref={notificationRef} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#191919',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingTop: 30,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    scrollContainer: {
        padding: 20,
    },
    inputDisabled: {
        color: '#A9A9A9',
    },
    passwordSection: {
        margin: 'auto',
        paddingTop: 20,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 10,
        width: '90%',
        justifyContent: 'center',
    },
    passwordButton: {

    },
    sectionTitle: {
        color: '#ffffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    button: {
        paddingTop: 20,
        paddingBottom: 20,
    }
});