import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { MainButton } from './MainButton';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  // --- INÍCIO DA CORREÇÃO: Novas props ---
  isConfirming?: boolean;
  confirmingText?: string;
  disableClose?: boolean;
  // --- FIM DA CORREÇÃO ---
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    visible, 
    title, 
    message, 
    onClose, 
    onConfirm,
    confirmText = "Confirmar",
    // --- INÍCIO DA CORREÇÃO: Desestruturar novas props ---
    isConfirming = false,
    confirmingText = "Confirmando...",
    disableClose = false
    // --- FIM DA CORREÇÃO ---
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      // --- INÍCIO DA CORREÇÃO: Impedir fechamento ---
      onRequestClose={disableClose ? () => {} : onClose}
      // --- FIM DA CORREÇÃO ---
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          <View style={styles.buttonContainer}>
            {/* --- INÍCIO DA CORREÇÃO: Lógica do botão de confirmação --- */}
            <MainButton 
              title={isConfirming ? confirmingText : confirmText} 
              onPress={onConfirm} 
              style={styles.confirmButton}
              disabled={isConfirming}
            />
            {/* --- FIM DA CORREÇÃO --- */}

            {/* --- INÍCIO DA CORREÇÃO: Lógica do botão de cancelar --- */}
            <MainButton 
              title="Cancelar" 
              onPress={onClose} 
              style={styles.cancelButton} 
              textStyle={styles.cancelButtonText}
              disabled={disableClose || isConfirming}
            />
            {/* --- FIM DA CORREÇÃO --- */}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
  },
  modalView: {
    margin: 20,
    backgroundColor: '#3C3C3C', 
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 25,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#ecebebff', 
    marginTop: 0,
  },
  cancelButtonText: {
    color: '#000000', 
  },
  confirmButton: {
    backgroundColor: '#C62828', 
  },
});