import React from 'react';
import { Appbar } from 'react-native-paper';
import theme from '../styles/theme';
import { useNavigation } from '@react-navigation/native';

const CustomAppbar = ({ title, showProfileAction = true, showBackAction = false, showActionIcon = false, onActionPress }) => {
  const navigation = useNavigation();

  const handleAvatarClick = () => {
    navigation.navigate('Profile'); // Replace 'Profile' with the name of your profile screen
  };

  const handleBackClick = () => {
    navigation.goBack();
  };

  return (
    <Appbar.Header mode='center-aligned' style={{ backgroundColor: theme.colors.elevation.level2 }}>
      {showBackAction && <Appbar.BackAction onPress={handleBackClick} />}
      {showActionIcon && <Appbar.Action icon="database-import-outline" onPress={onActionPress} />}
      <Appbar.Content title={title} />
      {showProfileAction && <Appbar.Action icon="account-circle" onPress={handleAvatarClick} />}
      
    </Appbar.Header>
  );
};

export default CustomAppbar;