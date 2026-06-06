import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../constants/colors';

type ThemeMode = 'light' | 'dark';

type AppTheme = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryDark: string;
  accent: string;
  white: string;
};

type ThemeContextType = {
  themeMode: ThemeMode;
  theme: AppTheme;
  colors: AppTheme & typeof COLORS;
  loading: boolean;
  isDark: boolean;
  isLight: boolean;
  toggleTheme: () => Promise<void>;
  setLightTheme: () => Promise<void>;
  setDarkTheme: () => Promise<void>;
};

const LIGHT_THEME: AppTheme = {
  background: COLORS.background,
  card: COLORS.card,
  text: COLORS.text,
  textSecondary: COLORS.textSecondary,
  border: COLORS.border,
  primary: COLORS.primary,
  primaryDark: COLORS.primaryDark,
  accent: COLORS.gold,
  white: COLORS.white,
};

const DARK_THEME: AppTheme = {
  background: '#07130F',
  card: '#10251E',
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',
  border: '#244A3D',
  primary: COLORS.gold,
  primaryDark: '#020A07',
  accent: COLORS.goldLight,
  white: COLORS.white,
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [theme, setTheme] = useState<AppTheme>(LIGHT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@app_theme');

      if (savedTheme === 'dark') {
        setThemeMode('dark');
        setTheme(DARK_THEME);
      } else {
        setThemeMode('light');
        setTheme(LIGHT_THEME);
      }
    } catch (error) {
      console.log('LOAD THEME ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  const setLightTheme = async () => {
    setThemeMode('light');
    setTheme(LIGHT_THEME);
    await AsyncStorage.setItem('@app_theme', 'light');
  };

  const setDarkTheme = async () => {
    setThemeMode('dark');
    setTheme(DARK_THEME);
    await AsyncStorage.setItem('@app_theme', 'dark');
  };

  const toggleTheme = async () => {
    if (themeMode === 'light') {
      await setDarkTheme();
    } else {
      await setLightTheme();
    }
  };

  const appColors = {
    ...COLORS,
    ...theme,
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        theme,
        colors: appColors,
        loading,
        isDark: themeMode === 'dark',
        isLight: themeMode === 'light',
        toggleTheme,
        setLightTheme,
        setDarkTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used inside ThemeProvider');
  }

  return context;
}

export default ThemeContext;