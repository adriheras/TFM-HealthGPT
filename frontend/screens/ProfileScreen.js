import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput,HelperText } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAppbar from '../components/CustomAppbar';

const ProfileScreen = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [error, setError] = useState('');

    const handleChangePassword = async () => {
        try {
            const response = await fetch('https://API_GATEWAY_URL/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${await AsyncStorage.getItem('userToken')}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error === 'La contraseña actual no coincide.') {
                    // Set the error state
                    setError('La contraseña actual no coincide.');
                } else {
                    throw new Error(data.error);
                }
            } else {
                console.log('Password changed successfully');
                setIsChangingPassword(false);
                setError('');
                // Handle successful password change here
            }
        } catch (error) {
            console.error('Error while changing the password:', error);
            // Handle other errors here
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            console.log('Logout successful');
            navigation.navigate('Auth');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <View>
            <CustomAppbar title="Mi perfil" showProfileAction={false} showBackAction={true} />
            <View style={styles.container}>
                {isChangingPassword && (
                    <>
                        <TextInput error={!!error}
                            label="Contraseña antigua"
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            secureTextEntry
                        />
                        <HelperText type="error" visible={!!error}>
                            {error}
                        </HelperText>
                        <TextInput
                            style={styles.input}
                            label="Contraseña nueva"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />
                        <Button style={styles.button} mode="contained" onPress={handleChangePassword}>
                            Confirmar cambio
                        </Button>
                    </>
                )}

                {!isChangingPassword && (<><Button style={styles.button} mode="contained" onPress={() => setIsChangingPassword(true)}>
                    Cambiar contraseña
                </Button><Button style={styles.button} mode="contained" buttonColor="#DD0000" onPress={handleLogout}>
                        Cerrar sesión
                    </Button></>
                )}


            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    input: {
        marginTop: 8,
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
    },
});

export default ProfileScreen;