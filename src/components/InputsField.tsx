import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface InputFieldProps extends TextInputProps {
    label: string;
}

export const InputsField = ({ label, secureTextEntry, maxLength, value, multiline, numberOfLines, ...rest }: InputFieldProps) => {
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!isPasswordVisible);
    };

    const wrapperStyles = [
        styles.inputWrapper,
        multiline && styles.multilineInputWrapper,
    ];

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            
            <View style={wrapperStyles}>
                <TextInput
                    style={[styles.input, multiline && styles.textarea]}
                    value={value}
                    maxLength={maxLength}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    placeholderTextColor="#A9A9A9"
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    {...rest}
                />
                
                {secureTextEntry && (
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                        <Icon 
                            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                            size={24} 
                            color="#808080" 
                        />
                    </TouchableOpacity>
                )}

                {maxLength && !multiline && ( 
                    <Text style={styles.charCounter}>
                        {String(value).length || 0} / {maxLength}
                    </Text>
                )}
            </View>
             {maxLength && multiline && ( 
                <Text style={styles.multilineCharCounter}>
                    {String(value).length || 0} / {maxLength}
                </Text>
            )}
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
    multilineInputWrapper: {
        height: 'auto', 
        minHeight: 120, 
        alignItems: 'flex-start', 
    },
    input: {
        flex: 1, 
        height: '100%',
        paddingHorizontal: 10,
        color: '#333333',
    },
    textarea: {
        paddingTop: 10, 
        paddingBottom: 10,
        textAlignVertical: 'top',
    },
    iconContainer: {
        padding: 10,
    },
    charCounter: {
        fontSize: 12,
        color: '#808080',
        paddingRight: 10,
    },
    // Novo estilo para o contador em campos multiline
    multilineCharCounter: {
        fontSize: 12,
        color: '#A9A9A9',
        alignSelf: 'flex-end',
        marginTop: 4,
    }
});