import React, { useCallback, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { AuthContext } from '../profile/AuthContext';
import { useFocusEffect } from '@react-navigation/native'; // Importa useFocusEffect
import { Table, Row, Rows } from 'react-native-table-component';

const HomeHealthCard = ({ selectedValue }) => {
  const { token } = useContext(AuthContext); // Obtén el username y token del AuthContext
  const [data, setData] = useState({ count: 0, min: {}, max: {} });

  useFocusEffect(
    useCallback(() => {
    fetch(`https://API_GATEWAY_URL/health`, { // Usa el username del AuthContext
      headers: {
        'Authorization': `${token}` // Incluye el token en los headers
      }
    }).then(response => response.json())
      .then(data => {
        let filteredData = data;
        if (selectedValue === 'week') {
          filteredData = data.filter(item => isThisWeek(new Date(item.fecha)));
        } else if (selectedValue === 'month') {
          filteredData = data.filter(item => isThisMonth(new Date(item.fecha)));
        } else if (selectedValue === 'year') {
          filteredData = data.filter(item => isThisYear(new Date(item.fecha)));
        }


        const count = filteredData.length;
        const getMin = (array) => array.length > 0 ? Math.min(...array) : 'N/A';
        const getMax = (array) => array.length > 0 ? Math.max(...array) : 'N/A';

        const min = {
          systolic: getMin(filteredData.map(item => item.bloodPressure.systolic).filter(value => !isNaN(value) && value > 0)),
          diastolic: getMin(filteredData.map(item => item.bloodPressure.diastolic).filter(value => !isNaN(value) && value > 0)),
          heartRate: getMin(filteredData.map(item => item.heartRate).filter(value => !isNaN(value) && value > 0)),
          bloodGlucose: getMin(filteredData.map(item => item.bloodGlucose).filter(value => !isNaN(value) && value > 0)),
          weight: getMin(filteredData.map(item => item.weight).filter(value => !isNaN(value) && value > 0))
        };

        const max = {
          systolic: getMax(filteredData.map(item => item.bloodPressure.systolic).filter(value => !isNaN(value) && value > 0)),
          diastolic: getMax(filteredData.map(item => item.bloodPressure.diastolic).filter(value => !isNaN(value) && value > 0)),
          heartRate: getMax(filteredData.map(item => item.heartRate).filter(value => !isNaN(value) && value > 0)),
          bloodGlucose: getMax(filteredData.map(item => item.bloodGlucose).filter(value => !isNaN(value) && value > 0)),
          weight: getMax(filteredData.map(item => item.weight).filter(value => !isNaN(value) && value > 0))
        };
        setData({ count, min, max });
      })
      .catch(error => console.error('Error:', error));
  }, [selectedValue,token])); // Agrega selectedValue a las dependencias del useEffect


  return (
    <Card>
      <Card.Content style={styles.content}>
        <Title style={styles.title}>Salud</Title>
        <Table borderStyle={{borderWidth: 2, borderColor: "rgb(16, 109, 32)"}}>
          <Row data={['', 'Mín', 'Máx']} style={styles.head} textStyle={styles.text}/>
          <Rows 
            data={[
              ['Sistólica (mmHg)', data.min.systolic, data.max.systolic],
              ['Diastólica (mmHg)', data.min.diastolic, data.max.diastolic],
              ['Ritmo cardíaco (bpm)', data.min.heartRate, data.max.heartRate],
              ['Glucemia (mg/dL)', data.min.bloodGlucose, data.max.bloodGlucose],
              ['Peso corporal (kg)', data.min.weight, data.max.weight]
            ]}
            textStyle={styles.text}
          />
        </Table>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginBottom: 10, // Add this line
  },
  head: { height: 40, backgroundColor: 'rgb(222, 229, 216)' },
  text: { margin: 6, textAlign: 'center'}
});

export default HomeHealthCard;