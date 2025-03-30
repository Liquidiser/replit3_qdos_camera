import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  View,
  ActivityIndicator,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Feather.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const theme = useTheme();

  // Get container style based on variant
  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
        };
    }
  };

  // Get text style based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return {
          color: theme.colors.primary,
        };
      case 'text':
        return {
          color: theme.colors.primary,
        };
      default:
        return {
          color: 'white',
        };
    }
  };

  // Get size style
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
        };
      case 'large':
        return {
          paddingVertical: 14,
          paddingHorizontal: 24,
        };
      default:
        return {
          paddingVertical: 10,
          paddingHorizontal: 20,
        };
    }
  };

  // Get text size based on button size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  // Get icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 22;
      default:
        return 18;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getContainerStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'text' ? theme.colors.primary : 'white'} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <Feather
              name={icon}
              size={getIconSize()}
              color={getTextStyle().color}
              style={styles.leftIcon}
            />
          )}
          
          <Text 
            style={[
              styles.text, 
              { fontSize: getTextSize() },
              getTextStyle(),
              textStyle,
            ]}
          >
            {title}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <Feather
              name={icon}
              size={getIconSize()}
              color={getTextStyle().color}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;
