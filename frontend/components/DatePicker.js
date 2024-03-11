import React from "react";
import { View, Text } from "react-native";
import { Button } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

export default function DatePicker({ selectedDate, onDateChange }) {
  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = React.useCallback(
    (params) => {
      setOpen(false);
      onDateChange(params.date); // Comunicar la fecha seleccionada al componente padre
    },
    [setOpen, onDateChange]
  );

  const goToPreviousDay = () => {
    let previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const goToNextDay = () => {
    let nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  return (
    <View style={{ alignItems: 'center', padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
          Elige una fecha
        </Button>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
        <Button onPress={goToPreviousDay} uppercase={false} mode="text">
          &lt;
        </Button>
        <View style={{ marginLeft: 32, marginRight: 32 }}>
          <Text>
            {selectedDate.toLocaleDateString()}
          </Text>
        </View>
        <Button onPress={goToNextDay} uppercase={false} mode="text">
          &gt;
        </Button>
      </View>
      <DatePickerModal
        animationType="slide"
        locale="es"
        mode="single"
        visible={open}
        onDismiss={onDismissSingle}
        date={selectedDate}
        onConfirm={onConfirmSingle}
        saveLabel="Guardar" // Cambiado a español, opcional
        label="Seleccionar fecha" // Cambiado a español, opcional
      />
    </View>
  );
}