// src/navigation/SellCarStack.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddCarDetailsScreen from '../screens/CarScreens/AddCarDetailsScreen';
import EditCarDetailsScreen from '../screens/CarScreens/EditCarDetailsScreen';



export type SellCarStackParamList = {
  CarsList: undefined;
  AddCarDetails: undefined;
  EditCarDetails: { carId: number };

};

const Stack = createNativeStackNavigator<SellCarStackParamList>();

export default function SellCarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen name="AddCarDetails" component={AddCarDetailsScreen} />
      <Stack.Screen name="EditCarDetails" component={EditCarDetailsScreen} />

    </Stack.Navigator>
  );
}
