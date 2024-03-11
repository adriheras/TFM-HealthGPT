import React, { useCallback, useState, useContext } from 'react';
import { Card, Title, Text } from 'react-native-paper';
import { StyleSheet, Dimensions } from 'react-native';
import { format,isSameDay, addDays, isWithinInterval, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear, getDaysInMonth  } from 'date-fns';
import { AuthContext } from '../profile/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { es } from 'date-fns/locale';


const HomeNutritionCard = ({ selectedValue }) => {
  const { token } = useContext(AuthContext); // Obtén el username y token del AuthContext
  const [data, setData] = useState({ labels: [], datasets: [{ data: [] }] });

  const chartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    yAxisLabel: 'kcal', // Add this line
  };

  useFocusEffect(
    useCallback(() => {
      fetch(`https://API_GATEWAY_URL/nutrition/foods`, {
        headers: {
          'Authorization': `${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log('Data:', data); // Log the data received from the server

          let labels = [];
          let dataset = [];
          if (selectedValue === 'week') {
            labels = eachDayOfInterval({
              start: startOfWeek(new Date(), { weekStartsOn: 1 }),
              end: endOfWeek(new Date(), { weekStartsOn: 1 })
            }).map(date => format(date, 'E', { locale: es }));
            console.log('Labels:', labels); // Log the labels

            const weekDays = eachDayOfInterval({
              start: startOfWeek(new Date(), { weekStartsOn: 1 }),
              end: endOfWeek(new Date(), { weekStartsOn: 1 })
            }).map(date => date);
            
            dataset = weekDays.map(date => {
              const dayData = data.filter(item => isSameDay(new Date(item.fecha), date));
            
              console.log('Day Data:', dayData); // Log the day data
            
              return dayData.reduce((total, item) => total + item.calorias, 0);
            });
            console.log('Dataset:', dataset); // Log the dataset
          } else if (selectedValue === 'month') {
            const currentMonth = new Date();
            const daysInMonth = getDaysInMonth(currentMonth);
            labels = Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, i) => {
              const startDay = i * 7 + 1;
              const endDay = Math.min((i + 1) * 7, daysInMonth);
              return `${startDay.toString().padStart(2, '0')} - ${endDay.toString().padStart(2, '0')}`;
            });

            dataset = labels.map((label, index) => {
              const weekStart = addDays(startOfMonth(new Date()), index * 7);
              const weekEnd = index === labels.length - 1 ? endOfMonth(new Date()) : addDays(weekStart, 6);
              const weekData = data.filter(item => {
                const itemDate = new Date(item.fecha);
                return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
              });
              const totalCalories = weekData.reduce((total, item) => total + item.calorias, 0);
              return totalCalories / 7;
            });
          } else if (selectedValue === 'year') {
            labels = eachMonthOfInterval({ start: startOfYear(new Date()), end: endOfYear(new Date()) })
              .map(date => date.toLocaleString('default', { month: 'narrow' }));
            dataset = labels.map((label, index) => {
              const monthData = data.filter(item => new Date(item.fecha).getMonth() === index);
              const totalCalories =  monthData.reduce((total, item) => total + item.calorias, 0);
              return totalCalories / 30;
            });
          }


          setData({
            labels,
            datasets: [{
              data: dataset
            }]
          });
        });
    }, [selectedValue])
  );

  return (
    <Card>
      <Card.Content>
        <Title style={styles.title}>Nutrición</Title>
        <Text variant="bodySmall" style={{ textAlign: 'left', marginLeft: '40px' }}>{'kcal'}</Text>
        <BarChart
          data={data}
          width={Dimensions.get("window").width - 52}
          height={220}
          chartConfig={chartConfig}
          fromZero
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
});
export default HomeNutritionCard;