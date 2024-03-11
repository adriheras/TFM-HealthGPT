import React from 'react';
import { Dimensions, View } from 'react-native';
import { Title, Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { eachDayOfInterval, startOfWeek, endOfWeek, format, eachWeekOfInterval, startOfMonth, endOfMonth, addDays, isWithinInterval, eachMonthOfInterval, getWeek, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

const HealthChart = ({ selectedParameter, data, selectedValue, selectedDate }) => {
    console.log('selectedValue:', selectedValue);
    if (!data || data.length === 0) {
        return <Text style={{ textAlign: 'center' }}>No hay datos</Text>;
    }
    console.log('Data:', data); // Log the data received from the server   

    let labels = [];
    let dataset = [];
    if (selectedValue === 'week') {
        labels = eachDayOfInterval({
            start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
            end: endOfWeek(selectedDate, { weekStartsOn: 1 })
        }).map(date => format(date, 'E', { locale: es }));
        console.log('Labels:', labels); // Log the labels

        dataset = labels.map(label => {
            const dayData = data.filter(item => format(new Date(item.fecha), 'E', { locale: es }) === label);
            console.log('Day Data:', dayData); // Log the day data

            const totalValue = dayData.reduce((total, item) => total + item.value, 0);
            return dayData.length > 0 ? totalValue / dayData.length : 0;
        });
    } else if (selectedValue === 'month') {
        labels = eachWeekOfInterval({ start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) })
            .map((date, index, array) => {
                const startOfWeekDate = addDays(startOfMonth(selectedDate), index * 7);
                const endOfWeekDate = index === array.length - 1 ? endOfMonth(selectedDate) : addDays(startOfWeekDate, 6);
                return `${format(startOfWeekDate, 'dd')} - ${format(endOfWeekDate, 'dd')}`;
            });

        dataset = labels.map((label, index) => {
            const weekStart = addDays(startOfMonth(selectedDate), index * 7);
            const weekEnd = index === labels.length - 1 ? endOfMonth(selectedDate) : addDays(weekStart, 6);
            const weekData = data.filter(item => {
                const itemDate = new Date(item.fecha);
                return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
            });
            const weekTotal = weekData.reduce((total, item) => total + item.value, 0);
            return weekData.length > 0 ? weekTotal / weekData.length : 0;
        });
    } else if (selectedValue === 'year') {
        labels = eachMonthOfInterval({ start: startOfYear(selectedDate), end: endOfYear(selectedDate) })
            .map(date => date.toLocaleString('default', { month: 'narrow' }));
        dataset = labels.map((label, index) => {
            const monthData = data.filter(item => new Date(item.fecha).getMonth() === index);
            const total = monthData.reduce((total, item) => total + item.value, 0);
            return monthData.length > 0 ? total / monthData.length : 0; // calculate average
        });
    }
    console.log('dataset:', dataset);

    let yAxisSuffix = '';
    if (selectedParameter === 'Peso corporal') {
        yAxisSuffix = ' kg';
    } else if (selectedParameter === 'Ritmo cardíaco') {
        yAxisSuffix = ' bpm';
    } else if (selectedParameter === 'Glucosa en sangre') {
        yAxisSuffix = ' mg/dL';
    }

    const colors = {
        'Peso corporal': '128, 0, 0', // blue
        'Ritmo cardíaco': '0, 128, 0', // green
        'Glucosa en sangre': '128, 128, 0', // yellow
    };

    let titleSuffix = '';
    if (selectedValue === 'week') {
        const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const endOfWeekDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
        titleSuffix = `Del ${format(startOfWeekDate, 'dd')} al ${format(endOfWeekDate, 'dd')} de ${format(startOfWeekDate, 'MMMM \'de\' yyyy', { locale: es })}`;
    } else if (selectedValue === 'month') {
        titleSuffix = format(selectedDate, 'MMMM \'de\' yyyy', { locale: es });
    } else if (selectedValue === 'year') {
        titleSuffix = format(selectedDate, 'yyyy');
    }

    return (
        <View>
            <Title style={{ textAlign: 'center', fontSize: 24 }}>{selectedParameter}</Title>
            <Title style={{ textAlign: 'center', fontSize: 16, marginBottom: '20px' }}>{titleSuffix}</Title>
            <Text variant="bodySmall" style={{ textAlign: 'left', marginLeft: '40px' }}>{yAxisSuffix}</Text> {/* Add this line */}
            <LineChart
                data={{
                    labels: labels,
                    datasets: [{ data: dataset, color: (opacity = 1) => `rgba(${colors[selectedParameter]}, ${opacity})` }],

                }}
                width={Dimensions.get('window').width - 80}
                height={Dimensions.get('window').height / 2}
                fromZero
                chartConfig={{
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                }}
                bezier
            />
        </View>
    );
};

export default HealthChart;