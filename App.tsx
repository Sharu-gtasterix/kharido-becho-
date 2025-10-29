// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CarListScreen from './src/screens/CarListScreen';
import ProductDetailsScreen from './src/screens/MobileScreens/ProductDetailsScreen';
import ChatScreen from './src/screens/ChatScreen';
import LiveBiddingScreen from './src/screens/LiveBiddingScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// ✅ New entry stacks (replace old SellProductStack/MyAdsStack usage here)
import SellEntryStack from './src/navigation/SellEntryStack';
import MyAdsEntryStack from './src/navigation/MyAdsEntryStack';
import { SafeAreaProvider } from 'react-native-safe-area-context';


import CustomTabBar from './src/components/CustomTabBar';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStackNav = createNativeStackNavigator();

// ✅ Home tab uses its own stack (keeps your original Home → CarList → ProductDetails → Chat flow)
function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStackNav.Screen name="CarListScreen" component={CarListScreen} />
      <HomeStackNav.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
      <HomeStackNav.Screen name="ChatScreen" component={ChatScreen} />
    </HomeStackNav.Navigator>
  );
}

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* Keep your existing tab order and labels */}
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Live Bidding" component={LiveBiddingScreen} />

      {/* ✅ SELL tab now points to SellEntryStack (SellProductScreen → per-entity Sell stacks) */}
      <Tab.Screen name="Sell Product" component={SellEntryStack} />

      {/* ✅ MY ADS tab now points to MyAdsEntryStack (MyAdsScreen → per-entity MyAds stacks) */}
      <Tab.Screen name="My Ads" component={MyAdsEntryStack} />

      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) return null; // Optional: splash component

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isSignedIn ? (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStackScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
