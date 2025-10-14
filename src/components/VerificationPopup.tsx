import React from 'react';
import { Modal, View, Text, StyleSheet, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { MainButton } from './MainButton';

interface VerificationPopupProps {
  visible: boolean;
  email: string;
  onResend: () => void;
  onClose: () => void;
  isResending: boolean;
  imageSource?: ImageSourcePropType;
}

export const VerificationPopup: React.FC<VerificationPopupProps> = ({
  visible,
  email,
  onResend,
  onClose,
  isResending,
  imageSource
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {imageSource && <Image source={imageSource} style={styles.popupImage} />}

          <Text style={styles.modalTitle}>Conta Não Verificada</Text>
          <Text style={styles.modalText}>
            Sua conta não foi verificada. Verifique seu email.
          </Text>

          <View style={styles.buttonContainer}>
            <View style={styles.mainButtonWrapper}>
              <MainButton
                title={isResending ? "Reenviando..." : "Reenviar Verificação"}
                onPress={onResend}
                disabled={isResending}
              />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
              disabled={isResending}
            >
              <Text style={styles.secondaryButtonText}>Ok, entendi</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
  popupImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
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
    gap: 15,
  },
  mainButtonWrapper: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '600',
  },
});
