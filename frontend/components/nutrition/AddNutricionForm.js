import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, TextInput, Button, Text, HelperText } from 'react-native-paper';
import axios from 'axios';
import { AuthContext } from '../profile/AuthContext';

const AddNutricionForm = ({ onNutricionAdded }) => {
  const { token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [nutricionData, setNutricionData] = useState({
    nombre: '',
    cantidad: '',
  });

  const handleInputChange = (field, value) => {
    setNutricionData({
      ...nutricionData,
      [field]: value,
    });
  };

  const validateInput = () => {
    const newErrors = {};
    if (!nutricionData.nombre || typeof nutricionData.nombre !== 'string') {
      newErrors.nombre = 'Nombre debe ser un cadena de texto';
    }
    if (!nutricionData.cantidad || isNaN(nutricionData.cantidad)) {
      newErrors.cantidad = 'Cantidad debe ser un número';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNutricion = async () => {
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://API_GATEWAY_URL/nutrition/foods', nutricionData, {
        headers: {
          'Authorization': `${token}`
        }
      });
      onNutricionAdded(response.data);
    } catch (error) {
      console.error('Error al añadir nutricion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleLarge}>Añadir comida</Text>
      <TextInput
        mode='outlined'
        label="Nombre"
        value={nutricionData.nombre}
        onChangeText={(value) => handleInputChange('nombre', value)}
        error={!!errors.nombre}
      />
      <HelperText type="error" visible={!!errors.nombre}>
        {errors.nombre}
      </HelperText>

      <TextInput
        mode='outlined'
        label="Cantidad (g)"
        value={nutricionData.cantidad}
        onChangeText={(value) => handleInputChange('cantidad', value)}
        style={styles.input} error={!!errors.cantidad}
      />
      <HelperText type="error" visible={!!errors.cantidad}>
        {errors.cantidad}
      </HelperText>

      {isLoading ? (
        <ActivityIndicator size={'large'} />
      ) : (
        <Button mode="contained" onPress={handleAddNutricion} style={styles.button}>
          Añadir comida
        </Button>
      )}
    </View>
  );
};

// ... rest of your code

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginTop: 12,
  },
  button: {
    marginTop: 20,
  },
  titleLarge: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default AddNutricionForm;