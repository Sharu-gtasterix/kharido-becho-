import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SellMobileStack from './SellMobileStack';
import SellLaptopStack from './SellLaptopStack';
import SellCarStack from './SellCarStack'; // ✅ Import added

export type SellProductStackParamList = {
  SellMobileStack: undefined;
  SellLaptopStack: undefined;
  SellCarStack: undefined; // ✅ Added Car stack route
};

const Stack = createNativeStackNavigator<SellProductStackParamList>();

export default function SellProductStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellMobileStack" component={SellMobileStack} />
      <Stack.Screen name="SellLaptopStack" component={SellLaptopStack} />
      <Stack.Screen name="SellCarStack" component={SellCarStack} /> {/* ✅ Added */}
    </Stack.Navigator>
  );
}
