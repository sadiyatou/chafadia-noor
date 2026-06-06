// src/routes/DashboardRoutes.jsx

import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  Home,
  MessageCircle,
  Users,
  BookOpen,
  CalendarDays,
  Compass,
  Moon,
  User,
} from 'lucide-react-native';

import COLORS from '../constants/colors';

// SCREENS FROM src/app
import DashboardScreen from '../app/dashboard';
import MessagesScreen from '../app/messages';
import CommunityScreen from '../app/community';
import QuranScreen from '../app/quran';
import CalendarScreen from '../app/calendar';
import MosqueScreen from '../app/mosques';
import RamadanScreen from '../app/ramadan';
import PrayerTimesScreen from '../app/prayertime';
import TasbeehScreen from '../app/tasbeeh';
import DuaScreen from '../app/dua';
import HadithScreen from '../app/hadith';
import ArabicScreen from '../app/arabic';
import CoursesScreen from '../app/courses';
import ArticlesScreen from '../app/articles';
import DownloadsScreen from '../app/downloads';
import IslamScreen from '../app/islam';
import RememberanceScreen from '../app/remembrance';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="PrayerTimes" component={PrayerTimesScreen} />
      <Stack.Screen name="Tasbeeh" component={TasbeehScreen} />
      <Stack.Screen name="Dua" component={DuaScreen} />
      <Stack.Screen name="Hadith" component={HadithScreen} />
      <Stack.Screen name="Arabic" component={ArabicScreen} />
      <Stack.Screen name="Courses" component={CoursesScreen} />
      <Stack.Screen name="Articles" component={ArticlesScreen} />
      <Stack.Screen name="Downloads" component={DownloadsScreen} />
      <Stack.Screen name="Islam" component={IslamScreen} />
      <Stack.Screen name="Remembrance" component={RememberanceScreen} />
    </Stack.Navigator>
  );
}

function QuranStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuranHome" component={QuranScreen} />
    </Stack.Navigator>
  );
}

function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarHome" component={CalendarScreen} />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesHome" component={MessagesScreen} />
    </Stack.Navigator>
  );
}

function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityHome" component={CommunityScreen} />
    </Stack.Navigator>
  );
}

function MosqueStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MosqueHome" component={MosqueScreen} />
    </Stack.Navigator>
  );
}

function RamadanStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RamadanHome" component={RamadanScreen} />
    </Stack.Navigator>
  );
}

export default function DashboardRoutes() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: COLORS.primaryDark,
          borderTopWidth: 0,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: '#D1D5DB',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Community"
        component={CommunityStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Quran"
        component={QuranStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Mosques"
        component={MosqueStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Ramadan"
        component={RamadanStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Moon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}