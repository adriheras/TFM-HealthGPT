import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, ActivityIndicator, HelperText, Text } from 'react-native-paper';
import axios from 'axios';
import { AuthContext } from '../profile/AuthContext';

const AddHealthForm = ({ onHealthAdded }) => {
  const { token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [healthData, setHealthData] = useState({
    bloodPressure: {
      systolic: '',
      diastolic: '',
    },
    heartRate: '',
    bloodGlucose: '',
    weight: '',
  });

  const handleInputChange = (field, value, subfield) => {
    if (subfield) {
      setHealthData({
        ...healthData,
        [field]: {
          ...healthData[field],
          [subfield]: value,
        },
      });
    } else {
      setHealthData({
        ...healthData,
        [field]: value,
      });
    }
  };

  const validateInput = () => {
    const newErrors = {};
    if (healthData.bloodPressure.systolic && isNaN(healthData.bloodPressure.systolic)) {
      newErrors.systolic = 'La presión arterial sistólica debe ser un número';
    }
    if (healthData.bloodPressure.diastolic && isNaN(healthData.bloodPressure.diastolic)) {
      newErrors.diastolic = 'La presión arterial diastólica debe ser un número';
    }
    if (healthData.heartRate && isNaN(healthData.heartRate)) {
      newErrors.heartRate = 'El ritmo cardíaco debe ser un número';
    }
    if (healthData.bloodGlucose && isNaN(healthData.bloodGlucose)) {
      newErrors.bloodGlucose = 'La glucosa en sangre debe ser un número';
    }
    if (healthData.weight && isNaN(healthData.weight)) {
      newErrors.weight = 'El peso corporal debe ser un número';
    }
    if ((healthData.bloodPressure.systolic && !healthData.bloodPressure.diastolic) || (!healthData.bloodPressure.systolic && healthData.bloodPressure.diastolic)) {
      newErrors.bloodPressure = 'Ambos campos de presión arterial deben estar rellenos';
    }
    if (parseInt(healthData.bloodPressure.systolic, 10) <= parseInt(healthData.bloodPressure.diastolic, 10)) {    
      newErrors.bloodPressure = 'La presión arterial sistólica debe ser mayor que la diastólica';
  }
    // Comprobar si todos los campos están vacíos
    if (!healthData.bloodPressure.systolic && !healthData.bloodPressure.diastolic && !healthData.heartRate && !healthData.bloodGlucose && !healthData.weight) {
      newErrors.allEmpty = 'Al menos uno de los campos debe estar relleno';
      
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddHealth = async () => {
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://API_GATEWAY_URL/health', healthData, {
        headers: {
          'Authorization': `${token}`
        }
      });
      onHealthAdded(response.data);
    } catch (error) {
      console.error('Error al añadir salud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
    <Text style={styles.titleLarge}>Añadir datos de salud</Text>
      <TextInput
        mode='outlined'
        label="Presión arterial sistólica (mmHg)"
        value={healthData.bloodPressure.systolic}
        onChangeText={(value) => handleInputChange('bloodPressure', value, 'systolic')}
        error={!!errors.systolic || !!errors.bloodPressure}
      />
      <HelperText type="error" visible={!!errors.systolic}>
        {errors.systolic}
      </HelperText>

      <TextInput
        mode='outlined'
        label="Presión arterial diastólica (mmHg)"
        value={healthData.bloodPressure.diastolic}
        onChangeText={(value) => handleInputChange('bloodPressure', value, 'diastolic')}
        style={styles.input}
        error={!!errors.diastolic || !!errors.bloodPressure}
      />
      <HelperText type="error" visible={!!errors.diastolic}>
        {errors.diastolic}
      </HelperText>
      <HelperText type="error" visible={!!errors.bloodPressure}>
        {errors.bloodPressure}
      </HelperText>

      <TextInput
        mode='outlined'
        label="Ritmo cardíaco (bpm)"
        value={healthData.heartRate}
        onChangeText={(value) => handleInputChange('heartRate', value)}
        style={styles.input}
        error={!!errors.heartRate}
      />
      <HelperText type="error" visible={!!errors.heartRate}>
        {errors.heartRate}
      </HelperText>

      <TextInput
        mode='outlined'
        label="Glucosa en sangre (mg/dL)"
        value={healthData.bloodGlucose}
        onChangeText={(value) => handleInputChange('bloodGlucose', value)}
        style={styles.input}
        error={!!errors.bloodGlucose}
      />
      <HelperText type="error" visible={!!errors.bloodGlucose}>
        {errors.bloodGlucose}
      </HelperText>

      <TextInput
        mode='outlined'
        label="Peso corporal (kg)"
        value={healthData.weight}
        onChangeText={(value) => handleInputChange('weight', value)}
        style={styles.input}
        error={!!errors.weight}
      />
      <HelperText type="error" visible={!!errors.weight}>
        {errors.weight}
      </HelperText>
      <HelperText type="error" visible={!!errors.allEmpty}>
        {errors.allEmpty}
      </HelperText>

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button mode="contained" onPress={handleAddHealth} style={styles.button}>
          Añadir datos
        </Button>
      )}
    </View>
  );
};

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

export default AddHealthForm;