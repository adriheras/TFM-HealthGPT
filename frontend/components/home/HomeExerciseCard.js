import React, { useCallback, useState, useContext } from 'react';
import { Card, Title,Text, Paragraph } from 'react-native-paper';
import { View, StyleSheet, Dimensions } from 'react-native';
import { isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { AuthContext } from '../profile/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { ProgressChart } from 'react-native-chart-kit';
import { Table, Row } from 'react-native-table-component'; // Importa Table y Row

const HomeExerciseCard = ({ selectedValue }) => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState({ workouts: 0, totalTime: 0 , calories:0});

  const targetValues = {
    week: {
      workouts: 7, // Assuming the target value for 'workouts' in 'week' is 7
      totalTime: 420, // Assuming the target value for 'totalTime' in 'week' is 420
      totalCalories: 2940, // Assuming the target value for 'totalCalories' in 'week' is 2940
    },
    month: {
      workouts: 30, // Assuming the target value for 'workouts' in 'month' is 30
      totalTime: 1800, // Assuming the target value for 'totalTime' in 'month' is 1800
      totalCalories: 12600, // Assuming the target value for 'totalCalories' in 'month' is 12600
    },
    year: {
      workouts: 365, // Assuming the target value for 'workouts' in 'year' is 365
      totalTime: 21900, // Assuming the target value for 'totalTime' in 'year' is 21900
      totalCalories: 153300, // Assuming the target value for 'totalCalories' in 'year' is 153300
    },
  };

  useFocusEffect(
    useCallback(() => {
      fetch(`https://API_GATEWAY_URL/exercise/exercises`, { // Usa el username del AuthContext
        headers: {
          'Authorization': `${token}` // Incluye el token en los headers
        }
      }).then(response => response.json())

        .then(data => {
          let filteredData = data;
          if (selectedValue === 'week') {
            filteredData = data.filter(item => isThisWeek(new Date(item.createdAt), { weekStartsOn: 1 }));
          } else if (selectedValue === 'month') {
            filteredData = data.filter(item => isThisMonth(new Date(item.createdAt)));
          } else if (selectedValue === 'year') {
            filteredData = data.filter(item => isThisYear(new Date(item.createdAt)));
          }

          const workouts = filteredData.length;
          const totalTime = filteredData.reduce((total, exercise) => total + exercise.duration, 0);
          const totalCalories = filteredData.reduce((total, exercise) => total + exercise.calories, 0) // Calcula la suma total de las calorías
          setData({ workouts, totalTime, totalCalories }); // Añade totalCalories a data
        })
        .catch(error => console.error('Error:', error));
    }, [selectedValue, token])); // Agrega selectedValue a las dependencias del useEffect

    const chartData = {
      labels: ["Días", "Tiempo", "Calorías"],
      data: [
        data.workouts && targetValues[selectedValue].workouts ? data.workouts / targetValues[selectedValue].workouts : 0,
        data.totalTime && targetValues[selectedValue].totalTime ? data.totalTime / targetValues[selectedValue].totalTime : 0,
        data.totalCalories && targetValues[selectedValue].totalCalories ? data.totalCalories / targetValues[selectedValue].totalCalories : 0,
      ],
    };

  // Define los datos de la tabla
  const tableData = [
    ['Días', data.workouts, targetValues[selectedValue].workouts],
    ['Tiempo (minutos)', data.totalTime, targetValues[selectedValue].totalTime],
    ['Calorías (kcal)', data.totalCalories, targetValues[selectedValue].totalCalories],
  ];

  return (
    <Card>
      <Card.Content>
        <Title style={styles.title}>Ejercicio</Title>
        <ProgressChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          strokeWidth={16}
          radius={32}
          chartConfig={{
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            color: (opacity = 1) => `rgba(25, 109, 32, ${opacity})`,
          }}
          hideLegend={false}
          style={{
            legendText: { fontSize: 10 }, // reduce the font size of the legend text
          }}
        />
        <Table borderStyle={{borderWidth: 2, borderColor: "rgb(25, 109, 32)"}}>
          <Row data={['', 'Valor actual', 'Valor objetivo']} style={styles.head} textStyle={styles.text}/>
          {
            tableData.map((rowData, index) => (
              <Row key={index} data={rowData} textStyle={styles.text}/>
            ))
          }
        </Table>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
  head: { height: 40, backgroundColor: 'rgb(222, 229, 216)' },
  text: { margin: 6, textAlign: 'center'}
});

export default HomeExerciseCard;