import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import HealthChart from './HealthChart';
import HealthPAChart from './HealthPAChart';

const HealthGrid = ({ data, selectedValue, selectedDate }) => {
    const urlImage = {
        bloodPressure: {
            translation: 'Presión arterial',
            url: 'https://www.uhc.com/content/dam/uhcdotcom/foundation/blog/newsroom/Blood-Pressure-Numbers_Newsroom.jpg'
        },
        heartRate: {
            translation: 'Ritmo cardíaco',
            url: 'https://apollohealthlib.blob.core.windows.net/health-library/2021/06/shutterstock_1236631984-scaled.jpg'
        },
        bloodGlucose: {
            translation: 'Glucosa en sangre',
            url: 'https://statics-cuidateplus.marca.com/cms/styles/natural/azblob/azucar-en-sangre1.jpg.webp?itok=WZoawC7Y'
        },
        weight: {
            translation: 'Peso corporal',
            url: 'https://www.eltiempo.com/files/article_main_1200/uploads/2023/03/10/640bc0bab5ce5.jpeg'
        },
    };
    const [selectedParameter, setSelectedParameter] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            {/* Cuadrícula de Cards */}
            <View style={styles.grid}>
                {Object.keys(urlImage).map((parameter, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => {
                            setSelectedParameter(parameter);
                            setModalVisible(true);
                        }}
                        style={styles.cardContainer}
                    >
                        <Card style={[styles.card, { overflow: 'hidden' }]}>
                            <Card.Cover source={{ uri: urlImage[parameter].url }} style={{ height: 150 }} />
                            <Card.Content>
                                <Text style={{ textAlign: 'center' }}>{urlImage[parameter].translation}</Text>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                ))}

            </View>

            {/* Gráfica */}
            <Modal
  animationType="fade"
  transparent={true}
  visible={modalVisible}
>
  <TouchableWithoutFeedback onPress={() => setModalVisible(!modalVisible)}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {selectedParameter &&
          (selectedParameter === 'bloodPressure' ?
            <HealthPAChart selectedValue={selectedValue} selectedDate={selectedDate}
              selectedParameter={urlImage[selectedParameter].translation}
              data={data.map(item => ({
                fecha: item.fecha,
                value: [item[selectedParameter].systolic, item[selectedParameter].diastolic]
              })).filter(item => item.value[0] !== null && item.value[1] !== null)}
            />
            :
            <HealthChart selectedValue={selectedValue} selectedDate={selectedDate}
              selectedParameter={urlImage[selectedParameter].translation}
              data={data.map(item => ({
                fecha: item.fecha,
                value: item[selectedParameter]
              })).filter(item => item.value !== null)}
            />
          )
        }
      </View>
    </View>
  </TouchableWithoutFeedback>
</Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center', // Centra verticalmente el contenido
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // Alinea las tarjetas en el espacio entre ellas
    },
    cardContainer: {
        width: '48%', // Ancho del 48% para dejar espacio entre las tarjetas
        aspectRatio: 1,
        marginVertical: 8,
    },
    card: {
        flex: 1, // Para que la tarjeta ocupe todo el espacio del contenedor
        borderWidth: 1,
        borderColor: '#666',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Añade un fondo semi-transparente
      },
      modalContent: {
        backgroundColor: 'white',
        width: '90%', // Adjust the width of the modal content
        maxWidth: '100%', // Ensure the content does not exceed the width of the modal
        maxHeight: '100%', // Ensure the content does not exceed the height of the modal
        padding: 20, // Add padding around the content
        borderRadius: 10, // Add rounded borders to the modal content
    },
});

export default HealthGrid;