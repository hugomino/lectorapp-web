// src/navigation/AppTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false, // 👈 OCULTAMOS EL TEXTO
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#3478f6',
          tabBarInactiveTintColor: '#999',
          tabBarIcon: ({ color }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home-outline';
            else if (route.name === 'Search') iconName = 'search-outline';
            else if (route.name === 'Statistics') iconName = 'stats-chart-outline';
            return <Ionicons name={iconName} size={22} color={color} />;
          }
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Statistics" component={StatisticsScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 70 : 60,
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    paddingTop: 4
  }
});
