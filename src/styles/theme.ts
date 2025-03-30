// Define the theme structure
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
}

// Define light theme
export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2196F3',      // Blue
    secondary: '#FF9800',    // Orange
    background: '#F5F5F5',   // Light gray
    cardBackground: '#FFFFFF', // White
    text: '#212121',         // Dark gray (almost black)
    textSecondary: '#757575', // Medium gray
    textTertiary: '#9E9E9E',  // Light gray
    border: '#E0E0E0',       // Very light gray
    success: '#4CAF50',      // Green
    error: '#F44336',        // Red
    warning: '#FFEB3B',      // Yellow
    info: '#2196F3',         // Blue (same as primary)
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
  },
};

// Define dark theme
export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#42A5F5',      // Lighter blue
    secondary: '#FFB74D',    // Lighter orange
    background: '#121212',   // Very dark gray
    cardBackground: '#1E1E1E', // Dark gray
    text: '#FFFFFF',         // White
    textSecondary: '#B0B0B0', // Light gray
    textTertiary: '#757575',  // Medium gray
    border: '#2C2C2C',       // Dark gray
    success: '#66BB6A',      // Lighter green
    error: '#EF5350',        // Lighter red
    warning: '#FFF176',      // Lighter yellow
    info: '#42A5F5',         // Lighter blue
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
  },
};
