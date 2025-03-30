import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { lightTheme, darkTheme } from '../styles/theme';

/**
 * Custom hook to access and manage theme
 */
export const useTheme = () => {
  const { state, dispatch } = useContext(AppContext);
  
  // Get the current theme
  const theme = state.isDarkMode ? darkTheme : lightTheme;
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };
  
  // Set specific theme
  const setTheme = (isDark: boolean) => {
    if (isDark !== state.isDarkMode) {
      toggleTheme();
    }
  };

  // Check if current theme is dark
  const isDarkTheme = state.isDarkMode;

  return {
    theme,
    toggleTheme,
    setTheme,
    isDarkTheme,
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
  };
};

export default useTheme;
