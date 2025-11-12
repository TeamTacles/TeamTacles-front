import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const injectDateTimeStyles = () => {
    if (Platform.OS !== 'web') return;

    const styleId = 'datetime-picker-custom-styles';
    if (typeof document !== 'undefined' && document.getElementById(styleId)) return; 

    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .date-input-custom::-webkit-calendar-picker-indicator,
            .time-input-custom::-webkit-calendar-picker-indicator {
                filter: invert(55%) sepia(94%) saturate(2571%) hue-rotate(351deg) brightness(98%) contrast(89%);
                cursor: pointer;
            }

            .date-input-custom::-webkit-calendar-picker-indicator:hover,
            .time-input-custom::-webkit-calendar-picker-indicator:hover {
                filter: invert(65%) sepia(94%) saturate(2571%) hue-rotate(351deg) brightness(108%) contrast(89%);
            }
        `;
        document.head.appendChild(style);
    }
};

export interface DatePickerFieldProps {
    mode: 'date' | 'time';
    value: Date;
    onChange: (date: Date) => void;
    label?: string;
    disabled?: boolean;
    editable?: boolean; 
    minDate?: Date;
    isOverdue?: boolean; 
    placeholder?: string;
    webInputStyle?: React.CSSProperties;
    inline?: boolean;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
    mode,
    value,
    onChange,
    label,
    disabled = false,
    editable = true,
    minDate,
    isOverdue = false,
    placeholder,
    webInputStyle,
    inline = false,
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
        injectDateTimeStyles();
    }, []);

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios'); // Mantém aberto no iOS até confirmação

        if (event.type === 'set' && selectedDate) {
            setInternalValue(selectedDate);
            if (Platform.OS !== 'ios') {
                onChange(selectedDate);
            }
        } else if (event.type !== 'set' && Platform.OS !== 'ios') {
            // Se cancelou no Android, reseta para o valor original
            setInternalValue(value);
        }
    };

    // Função de confirmação para iOS
    const confirmIOSDate = () => {
        setShowPicker(false);
        onChange(internalValue);
    };

    // Função para cancelar no iOS
    const cancelIOSDate = () => {
        setShowPicker(false);
        setInternalValue(value); // Reseta para o valor original
    };

    // Formata o valor para display
    const formatValue = () => {
        if (mode === 'date') {
            return value.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        } else {
            return value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
    };

    // Renderização para WEB
    if (Platform.OS === 'web') {
        const inputElement = mode === 'date' ? (
            <input
                type="date"
                value={`${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`}
                onChange={(e) => {
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    const newDate = new Date(year, month - 1, day, 0, 0, 0, 0);
                    onChange(newDate);
                }}
                disabled={disabled || !editable}
                min={minDate ? `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}` : undefined}
                className="date-input-custom"
                style={{
                    width: '100%',
                    padding: inline ? '8px' : '12px',
                    paddingRight: '40px',
                    backgroundColor: inline ? 'transparent' : '#1E1E1E',
                    color: isOverdue ? '#ff4545' : '#FFFFFF',
                    border: inline ? 'none' : '1px solid #3C3C3C',
                    borderRadius: inline ? '0' : '8px',
                    fontSize: '16px',
                    fontWeight: inline ? 'bold' : 'normal',
                    marginBottom: inline ? '0' : '16px',
                    boxSizing: 'border-box',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    colorScheme: 'dark',
                    cursor: disabled || !editable ? 'not-allowed' : 'pointer',
                    opacity: disabled || !editable ? 0.5 : 1,
                    ...webInputStyle,
                }}
            />
        ) : (
            <input
                type="time"
                value={`${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`}
                onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newTime = new Date(value);
                    newTime.setHours(hours, minutes, 0, 0);
                    onChange(newTime);
                }}
                disabled={disabled || !editable}
                className="time-input-custom"
                style={{
                    width: '100%',
                    padding: inline ? '8px' : '12px',
                    paddingRight: '40px',
                    backgroundColor: inline ? 'transparent' : '#1E1E1E',
                    color: isOverdue ? '#ff4545' : '#FFFFFF',
                    border: inline ? 'none' : '1px solid #3C3C3C',
                    borderRadius: inline ? '0' : '8px',
                    fontSize: '16px',
                    fontWeight: inline ? 'bold' : 'normal',
                    marginBottom: inline ? '0' : '16px',
                    boxSizing: 'border-box',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    colorScheme: 'dark',
                    cursor: disabled || !editable ? 'not-allowed' : 'pointer',
                    opacity: disabled || !editable ? 0.5 : 1,
                    ...webInputStyle,
                }}
            />
        );

        // Se inline, retorna apenas o input
        if (inline) {
            return inputElement;
        }

        // Senão, retorna com label
        return (
            <>
                {label && <Text style={styles.label}>{label}</Text>}
                {inputElement}
            </>
        );
    }

    // Renderização para MOBILE
    return (
        <>
            {inline ? (
                <Pressable
                    onPress={() => editable && !disabled && setShowPicker(true)}
                    disabled={!editable || disabled}
                >
                    <Text style={[
                        styles.inlineClickableText,
                        isOverdue && styles.overdueText,
                        (!editable || disabled) && styles.disabledText
                    ]}>
                        {formatValue()}
                    </Text>
                </Pressable>
            ) : (
                <Pressable onPress={() => editable && !disabled && setShowPicker(true)}>
                    <View pointerEvents="none">
                        <Text style={styles.label}>{label}</Text>
                        <View style={[styles.mobileInput, (disabled || !editable) && styles.mobileInputDisabled]}>
                            <Text style={[styles.mobileInputText, isOverdue && styles.overdueText]}>
                                {formatValue()}
                            </Text>
                        </View>
                    </View>
                </Pressable>
            )}

            {showPicker && (
                <DateTimePicker
                    mode={mode}
                    display="default"
                    value={internalValue}
                    onChange={handleDateChange}
                    minimumDate={minDate}
                />
            )}

            {showPicker && Platform.OS === 'ios' && (
                <View style={styles.iosPickerButtons}>
                    <TouchableOpacity style={styles.iosPickerButton} onPress={cancelIOSDate}>
                        <Text style={styles.iosPickerButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iosPickerButton, styles.iosPickerButtonConfirm]} onPress={confirmIOSDate}>
                        <Text style={styles.iosPickerButtonText}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    mobileInput: {
        width: '100%',
        padding: 12,
        backgroundColor: '#1E1E1E',
        borderColor: '#3C3C3C',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
    },
    mobileInputDisabled: {
        opacity: 0.5,
    },
    mobileInputText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    inlineClickableText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledText: {
        opacity: 0.5,
    },
    overdueText: {
        color: '#ff4545',
    },
    iosPickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#3C3C3C',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#555',
    },
    iosPickerButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    iosPickerButtonConfirm: {
        backgroundColor: '#EB5F1C',
        borderRadius: 8,
    },
    iosPickerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
