import React from 'react';
import { Dimensions, View } from 'react-native';
import { Text, Title } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { eachDayOfInterval, startOfWeek, endOfWeek, format, eachWeekOfInterval, startOfMonth, endOfMonth, addDays, isWithinInterval, eachMonthOfInterval, startOfYear, endOfYear, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const Legend = ({ color, label }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ width: 10, height: 10, backgroundColor: color, marginRight: 5 }} />
        <Text>{label}</Text>
    </View>
);

const HealthPAChart = ({ selectedParameter, data, selectedValue, selectedDate }) => {
    if (!data || data.length === 0) {
        return <Text style={{ textAlign: 'center' }}>No hay datos</Text>;
    }

    let labels = [];
    let systolicDataset = [];
    let diastolicDataset = [];

    if (selectedValue === 'week') {
        labels = eachDayOfInterval({
            start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
            end: endOfWeek(selectedDate, { weekStartsOn: 1 })
        });

        systolicDataset = labels.map(date => {
            const dayData = data.filter(item => {
                const itemDate = new Date(item.fecha);
                return itemDate.getDate() === date.getDate() && itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
            });
            const totalSystolic = dayData.reduce((total, item) => total + item.value[0], 0);
            return dayData.length > 0 ? totalSystolic / dayData.length : 0;
        });

        diastolicDataset = labels.map(date => {
            const dayData = data.filter(item => {
                const itemDate = new Date(item.fecha);
                return itemDate.getDate() === date.getDate() && itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
            });
            const totalDiastolic = dayData.reduce((total, item) => total + item.value[1], 0);
            return dayData.length > 0 ? totalDiastolic / dayData.length : 0;
        });

        labels = labels.map(date => format(date, 'E', { locale: es }));
    } else if (selectedValue === 'month') {
        labels = eachWeekOfInterval({ start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) })
            .map((date, index, array) => {
                const startOfWeekDate = addDays(startOfMonth(selectedDate), index * 7);
                const endOfWeekDate = index === array.length - 1 ? endOfMonth(selectedDate) : addDays(startOfWeekDate, 6);
                return `${format(startOfWeekDate, 'dd')} - ${format(endOfWeekDate, 'dd')}`;
            });

        systolicDataset = labels.map((label, index) => {
            const weekStart = addDays(startOfMonth(selectedDate), index * 7);
            const weekEnd = index === labels.length - 1 ? endOfMonth(selectedDate) : addDays(weekStart, 6);
            const weekData = data.filter(item => {
                const itemDate = new Date(item.fecha);
                return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
            });
            const weekTotalSystolic = weekData.reduce((total, item) => total + item.value[0], 0);
            return weekData.length > 0 ? weekTotalSystolic / weekData.length : 0;
        });

        diastolicDataset = labels.map((label, index) => {
            const weekStart = addDays(startOfMonth(selectedDate), index * 7);
            const weekEnd = index === labels.length - 1 ? endOfMonth(selectedDate) : addDays(weekStart, 6);
            const weekData = data.filter(item => {
                const itemDate = new Date(item.fecha);
                return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
            });
            const weekTotalDiastolic = weekData.reduce((total, item) => total + item.value[1], 0);
            return weekData.length > 0 ? weekTotalDiastolic / weekData.length : 0;
        });
    } else if (selectedValue === 'year') {
        labels = eachMonthOfInterval({ start: startOfYear(selectedDate), end: endOfYear(selectedDate) })
            .map(date => date.toLocaleString('default', { month: 'narrow' }));

        systolicDataset = labels.map((label, index) => {
            const monthData = data.filter(item => new Date(item.fecha).getMonth() === index);
            const totalSystolic = monthData.reduce((total, item) => total + item.value[0], 0);
            return monthData.length > 0 ? totalSystolic / monthData.length : 0;
        });

        diastolicDataset = labels.map((label, index) => {
            const monthData = data.filter(item => new Date(item.fecha).getMonth() === index);
            const totalDiastolic = monthData.reduce((total, item) => total + item.value[1], 0);
            return monthData.length > 0 ? totalDiastolic / monthData.length : 0;
        });
    }

    const systolicValues = systolicDataset; // Use the calculated systolic dataset
    const diastolicValues = diastolicDataset; // Use the calculated diastolic dataset
    const dates = labels; // Use the calculated labels



    console.log(selectedValue, systolicValues, diastolicValues);

    let yAxisSuffix = ' mmHg';

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
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Legend color="rgba(134, 65, 244, 1)" label="Sistólica" />
                <Legend color="rgba(0, 123, 255, 1)" label="Diastólica" />
            </View>
            <Text variant="bodySmall" style={{ textAlign: 'left', marginLeft: '40px' }}>{yAxisSuffix}</Text>
            <LineChart
                data={{
                    labels: dates,
                    datasets: [
                        {
                            data: systolicValues,
                            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                        },
                        {
                            data: diastolicValues,
                            color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                        }
                    ]
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

export default HealthPAChart;