import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { FAB } from 'react-native-paper';
import ExerciseList from '../components/exercise/ExerciseList';
import AddExerciseForm from '../components/exercise/AddExerciseForm';
import axios from 'axios';
import CustomAppbar from '../components/CustomAppbar';
import { AuthContext } from '../components/profile/AuthContext';

function EjercicioScreen() {
  const [showForm, setShowForm] = useState(false);
  const [exercises, setExercises] = useState([]); // La lista de ejercicios
  const { token }  = useContext(AuthContext);
  const listOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get(`https://API_GATEWAY_URL/exercise/exercises/`, {
          headers: {
            'Authorization': `${token}`
          }});
        setExercises(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: showForm ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(listOpacity, {
      toValue: showForm ? 0 : 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [showForm]);

  const handleExerciseAdded = (newExercise) => {
    // Actualiza la lista de ejercicios con el nuevo ejercicio
    setExercises([...exercises, newExercise]);

    // Oculta el formulario después de agregar el ejercicio
    setShowForm(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomAppbar title="Ejercicio" />
      {showForm ? (
        <Animated.View style={{ flex: 1, opacity: formOpacity }}>
          <AddExerciseForm onExerciseAdded={handleExerciseAdded} />
        </Animated.View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: listOpacity }}>
          <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
            <ExerciseList exercises={exercises} />
          </ScrollView>
        </Animated.View>
      )}
      <FAB
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        variant='primary'
        icon={showForm ? 'minus' : 'plus'}
        onPress={() => setShowForm(!showForm)}
      />
    </View>
  );
}

export default EjercicioScreen;