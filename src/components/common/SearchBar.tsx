import React from "react";

import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity } from 'react-native';

interface SearchBarProps {
    title: string;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onSearch?: (term: string) => void;
}

const lupa = require('../../assets/lupa.png')

export const SearchBar = ({ title, placeholder, value, onChangeText, onSearch }: SearchBarProps) => {

    const handleSearch = () => {
        if (onSearch) {
            onSearch(value ?? ''); 
        }
    };

    return (
        <View style={ styles.container }>
            <Text style={ styles.titleSearchBar }>
                { title }
            </Text>
            <View style={ styles.containerSearchBar }>
                <TouchableOpacity onPressIn={handleSearch}>
                    <Image source={ lupa } style={ styles.imagemSearch } />
                </TouchableOpacity>
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    placeholderTextColor="#B0B0B0"
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={handleSearch}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 30,
        gap: 20
    },
    titleSearchBar: {
        color: 'white',
        fontSize: 25,
        fontWeight: 800
    }, 
    imagemSearch: {
        width: 30,
        height: 30,
        margin: 10
    },
    containerSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#808080',
        borderWidth: 2,
        borderRadius: 15
    },
    textInput: {
        flex: 1,
        color: '#B0B0B0',
        fontSize: 17,
    }
});