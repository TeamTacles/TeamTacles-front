import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface InputFieldProps extends TextInputProps {
    label: string;
}

export const InputsField = ({ label, secureTextEntry, maxLength, value, ...rest }: InputFieldProps) => {
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    placeholderTextColor="#A9A9A9"
                    {...rest}
                />
                
                {/* icone p ver senha - se tiver secureTextEntry */}
                {secureTextEntry && (
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                        <Icon 
                            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                            size={24} 
                            color="#808080" 
                        />
                    </TouchableOpacity>
                )}

                {maxLength && (
                    <Text style={styles.charCounter}>
                        {value?.length || 0} / {maxLength}
                    </Text>
                )}

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 5,
        marginTop: 20,
        width: '100%',
    },
    label: {
        fontSize: 16,
        color: '#ffffff',   
        marginBottom: 5,
        alignSelf: 'flex-start',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderColor: '#BC6135',
        borderWidth: 1,
        borderRadius: 8,
        height: 45, 
    },
    input: {
        flex: 1, 
        height: '100%',
        paddingHorizontal: 10,
        color: '#333333',
    },
    iconContainer: {
        padding: 10,
    },
    charCounter: {
        fontSize: 12,
        color: '#808080',
    },
});