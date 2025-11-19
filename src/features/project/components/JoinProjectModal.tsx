import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { InputsField } from '../../../components/common/InputsField';
import { MainButton } from '../../../components/common/MainButton';
import { projectService } from '../services/projectService';
import { InfoPopup } from '../../../components/common/InfoPopup';

interface JoinProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

export const JoinProjectModal: React.FC<JoinProjectModalProps> = ({ visible, onClose, onSuccess }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoPopup, setInfoPopup] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' });

  const handleJoin = async () => {
    if (!token.trim()) {
      setInfoPopup({ visible: true, title: 'Atenção', message: 'Por favor, cole o código do projeto.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await projectService.joinProjectWithLink(token.trim());
      
      // Sucesso!
      setInfoPopup({ visible: true, title: 'Sucesso!', message: 'Você entrou no projeto.', type: 'success' });
      
      setTimeout(() => {
        setToken('');
        setInfoPopup({ visible: false, title: '', message: '', type: 'success' });
        onSuccess(); 
        onClose();
      }, 1500);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Código inválido ou você já está neste projeto.';
      setInfoPopup({ visible: true, title: 'Erro', message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setToken('');
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={handleClose}>
      <View style={styles.centeredView}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalView}>
          
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="close-outline" size={30} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Entrar em Projeto</Text>
          <Text style={styles.subtitle}>Cole o código de convite que você recebeu.</Text>

          <View style={styles.inputContainer}>
            <InputsField
              label="Código do Projeto"
              placeholder="Ex: 550e8400-e29b..."
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
            />
          </View>

          <MainButton
            title={loading ? "Entrando..." : "Entrar"}
            onPress={handleJoin}
            disabled={loading}
          />

        </KeyboardAvoidingView>
      </View>

      <InfoPopup
        visible={infoPopup.visible}
        title={infoPopup.title}
        message={infoPopup.message}
        onClose={() => setInfoPopup({ ...infoPopup, visible: false })}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  modalView: {
    width: '90%',
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 20,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 20
  }
});
