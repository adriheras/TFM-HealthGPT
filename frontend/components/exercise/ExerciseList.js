import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title } from 'react-native-paper';
import moment from 'moment';
import ExerciseCard from './ExerciseCard'; // Importa ExerciseCard


const ExerciseList = ({ exercises }) => {
  // Agrupar ejercicios por días
  const exercisesByDay = exercises.reduce((acc, exercise) => {
    const day = moment(exercise.createdAt).format('YYYY-MM-DD');
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(exercise);
    return acc;
  }, {});

  moment.locale('es');

  for (let day in exercisesByDay) {
    exercisesByDay[day].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return (
    <View>
      {Object.entries(exercisesByDay)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .map(([day, exercises]) => (
          <View key={day}>
            <Title style={{ textAlign: 'center' }}>{moment(day).format('DD MMMM')}</Title>
            {exercises.map((exercise) => (
              <View key={exercise._id} style={styles.cardContainer}>
                <ExerciseCard exercise={exercise} />
              </View>
            ))}
          </View>
        ))}
    </View>
  );

};

const styles = StyleSheet.create({
  centeredTitle: {
    textAlign: 'center',
  },
  cardContainer: {
    marginVertical: 5, // Adjust this value as needed
  },
});

export default ExerciseList;
