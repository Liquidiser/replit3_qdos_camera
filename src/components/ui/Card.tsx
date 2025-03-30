import React, { ReactNode } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  elevation?: number;
  padding?: number | string;
  footer?: ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  onPress,
  style,
  titleStyle,
  subtitleStyle,
  elevation = 2,
  padding = 16,
  footer,
}) => {
  const theme = useTheme();

  // Outer wrapper
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[
        styles.container,
        {
          elevation,
          backgroundColor: theme.colors.cardBackground,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {/* Card Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text 
              style={[
                styles.title, 
                { color: theme.colors.text },
                titleStyle
              ]}
            >
              {title}
            </Text>
          )}
          
          {subtitle && (
            <Text 
              style={[
                styles.subtitle, 
                { color: theme.colors.textSecondary },
                subtitleStyle
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      )}
      
      {/* Card Content */}
      <View style={[styles.content, { padding }]}>
        {children}
      </View>
      
      {/* Card Footer */}
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default Card;
