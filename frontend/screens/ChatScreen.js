import React, { useState, useEffect, useContext } from 'react';
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Surface, Checkbox, ActivityIndicator, Dialog } from 'react-native-paper';
import CustomAppbar from '../components/CustomAppbar';
import axios from 'axios';
import { AuthContext } from '../components/profile/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


function ChatScreen() {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseChecked, setExerciseChecked] = useState(false);
  const [healthDataChecked, setHealthDataChecked] = useState(false);
  const [foodChecked, setFoodChecked] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const loadMessages = async () => {
    const storedMessages = await AsyncStorage.getItem('messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    loadMessages();
  }, []);

  const startNewChat = () => {
    setDialogVisible(true);
  };

  const handleConfirmNewChat = async () => {
    setDialogVisible(false);
    await AsyncStorage.removeItem('messages');
    const newMessage = [
      {
        _id: 1,
        text: 'Hola! Soy tu asistente de salud. ¿Cómo puedo ayudarte hoy?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Asistente de Salud',
        },
      },
    ];
    setMessages(newMessage);
    await AsyncStorage.setItem('messages', JSON.stringify(newMessage));
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: 'rgb(16, 109, 32)' // This is the user's messages color
          },
          left: {
            backgroundColor: 'rgb(255, 255, 255)' // This will be the assistant's messages color
          }
        }}
      />
    );
  }


  const renderSend = (props) => {
    return (
      <Send {...props} textStyle={{ color: 'rgb(16, 109, 32)' }}>
      </Send>
    );
  }

  const onSend = async (messagesToSend = []) => {
    setIsLoading(true);
    setMessages(previousMessages => {
      const updatedMessages = GiftedChat.append(previousMessages, messagesToSend);
      AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
      return updatedMessages;
    });

    const message = messagesToSend[0].text;

    const response = await axios.post('https://API_GATEWAY_URL/chatbot/chat', {
      prompt: message,
      conversation: messages.slice(0).reverse().map(msg => ({ role: msg.user._id === 1 ? 'user' : 'assistant', content: msg.text })),
    }, {
      headers: {
        'Authorization': `${token}`
      }
    });

    const apiMessage = response.data;

    setMessages(previousMessages => {
      const updatedMessages = GiftedChat.append(previousMessages, {
        _id: Math.round(Math.random() * 1000000),
        text: apiMessage,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Asistente de Salud',
        },
      });
      AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
      return updatedMessages;
    });
    loadMessages(); // Load messages after sending a message
    setIsLoading(false);
  }

  const renderInputToolbar = (props) => {
    if (isLoading) {
      return <ActivityIndicator />;
    }
    return <InputToolbar {...props} />;
  };

  const fetchExercisesAndSendToChatbot = async () => {
    try {
      const response = await axios.get('https://API_GATEWAY_URL/exercise/exercises', {
        headers: {
          'Authorization': `${token}`
        }
      });
      const exercises = response.data;
      exercises.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const lastTenExercises = exercises.slice(0, 10);
      const formattedExercises = lastTenExercises.map((exercise, index) => {
        return `${index + 1}. ${exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}: Duración: ${exercise.duration} minutos, Distancia: ${exercise.distance} km, Calorías quemadas: ${exercise.calories}, Fecha: ${new Date(exercise.createdAt).toLocaleString()}`;
      }).join('\n');
      return "Estos han sido mis últimos ejercicios:\n" + formattedExercises;
    } catch (error) {
      console.error('Error while fetching exercises:', error);
    }
  };

  const fetchHealthDataAndSendToChatbot = async () => {
    try {
      const response = await axios.get('https://API_GATEWAY_URL/health', {
        headers: {
          'Authorization': `${token}`
        }
      });
      const healthDataArray = response.data;
      healthDataArray.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      const lastTenHealthData = healthDataArray.slice(0, 10);
      const formattedHealthDataArray = lastTenHealthData.map((healthData, index) => {
        return `${index + 1}. Presión arterial: ${healthData.bloodPressure.systolic}/${healthData.bloodPressure.diastolic}, Frecuencia cardíaca: ${healthData.heartRate}, Glucosa en sangre: ${healthData.bloodGlucose}, Peso: ${healthData.weight}, Fecha: ${new Date(healthData.fecha).toLocaleString()}`;
      }).join('\n');
      return "Estos son mis últimos datos de salud:\n" + formattedHealthDataArray;
    } catch (error) {
      console.error('Error while fetching health data:', error);
    }
  };

  const fetchFoodsAndSendToChatbot = async () => {
    try {
      const response = await axios.get('https://API_GATEWAY_URL/nutrition/foods', {
        headers: {
          'Authorization': `${token}`
        }
      });
      const foods = response.data;
      foods.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      const lastTenFoods = foods.slice(0, 10);
      const formattedFoods = lastTenFoods.map((food, index) => {
        return `${index + 1}. ${food.nombre}: Calorías: ${food.calorias}, Cantidad: ${food.cantidad}g, Fecha: ${new Date(food.fecha).toLocaleString()}`;
      }).join('\n');
      return "Estos son mis últimos alimentos consumidos:\n" + formattedFoods;
    } catch (error) {
      console.error('Error while fetching foods:', error);
    }
  };

  const handleSendData = async () => {
    let message = 'Voy a enviarte datos míos para que tengas un contexto más específico a la hora de resolver dudas.' + '\n\n';
    if (exerciseChecked) message += await fetchExercisesAndSendToChatbot() + '\n\n';
    if (healthDataChecked) message += await fetchHealthDataAndSendToChatbot() + '\n\n';
    if (foodChecked) message += await fetchFoodsAndSendToChatbot() + '\n\n';
    onSend([{ _id: Math.round(Math.random() * 1000000), text: message, createdAt: new Date(), user: { _id: 1 } }]);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <CustomAppbar title="Chat" showActionIcon onActionPress={() => setModalVisible(true)} />
      <Button mode="text" onPress={startNewChat}>Iniciar nuevo chat</Button>
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Confirmación</Dialog.Title>
          <Dialog.Content>
            <Text>¿Estás seguro de que quieres iniciar un nuevo chat?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>No</Button>
            <Button onPress={handleConfirmNewChat}>Sí</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Surface style={{ padding: 20, margin: 20, backgroundColor: 'white', elevation: 4, borderRadius: 20 }}>
            <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 20 }}>Importar datos al chat</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>Datos de ejercicios</Text>
              <Checkbox
                status={exerciseChecked ? 'checked' : 'unchecked'}
                onPress={() => {
                  setExerciseChecked(!exerciseChecked);
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>Datos de salud</Text>
              <Checkbox
                status={healthDataChecked ? 'checked' : 'unchecked'}
                onPress={() => {
                  setHealthDataChecked(!healthDataChecked);
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>Datos de nutrición</Text>
              <Checkbox
                status={foodChecked ? 'checked' : 'unchecked'}
                onPress={() => {
                  setFoodChecked(!foodChecked);
                }}
              />
            </View>
            <Button mode="contained-tonal" onPress={handleSendData} style={{ marginTop: 10 }}>Enviar datos</Button>
            <Button mode="text" onPress={() => setModalVisible(false)}>Cancelar</Button>
          </Surface>
        </Modal>
      </Portal>
      {isLoaded ? (
        <GiftedChat
          messages={messages || []}
          onSend={messages => onSend(messages)}
          user={{
            _id: 1,
          }}
          renderBubble={renderBubble}
          renderSend={renderSend}
          renderInputToolbar={renderInputToolbar}
        />
      ) : (
        <ActivityIndicator size="large" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatScreen;