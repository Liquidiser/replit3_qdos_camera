import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { QRCodeData } from '../api/qrService';
import { darkTheme, lightTheme } from '../styles/theme';

// Define the shape of the context state
interface AppState {
  isQRDetected: boolean;
  activeQRData: QRCodeData | null;
  capturedMedia: {
    path: string;
    type: 'photo' | 'video';
    timestamp: number;
  }[];
  theme: typeof lightTheme;
  isDarkMode: boolean;
  isUploadingMedia: boolean;
  uploadProgress: number;
}

// Define actions that can be dispatched to the reducer
type AppAction =
  | { type: 'SET_QR_DETECTED'; payload: boolean }
  | { type: 'SET_ACTIVE_QR_DATA'; payload: QRCodeData | null }
  | { type: 'ADD_CAPTURED_MEDIA'; payload: { path: string; type: 'photo' | 'video' } }
  | { type: 'REMOVE_CAPTURED_MEDIA'; payload: string } // path as identifier
  | { type: 'CLEAR_CAPTURED_MEDIA' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_UPLOADING_MEDIA'; payload: boolean }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: number };

// Define context provider props
interface AppProviderProps {
  children: ReactNode;
}

// Create a Context object
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: {
    isQRDetected: false,
    activeQRData: null,
    capturedMedia: [],
    theme: lightTheme,
    isDarkMode: false,
    isUploadingMedia: false,
    uploadProgress: 0,
  },
  dispatch: () => null,
});

// Define the reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_QR_DETECTED':
      return {
        ...state,
        isQRDetected: action.payload,
      };
    case 'SET_ACTIVE_QR_DATA':
      return {
        ...state,
        activeQRData: action.payload,
      };
    case 'ADD_CAPTURED_MEDIA':
      return {
        ...state,
        capturedMedia: [
          ...state.capturedMedia,
          {
            ...action.payload,
            timestamp: Date.now(),
          },
        ],
      };
    case 'REMOVE_CAPTURED_MEDIA':
      return {
        ...state,
        capturedMedia: state.capturedMedia.filter(
          (media) => media.path !== action.payload
        ),
      };
    case 'CLEAR_CAPTURED_MEDIA':
      return {
        ...state,
        capturedMedia: [],
      };
    case 'TOGGLE_THEME':
      return {
        ...state,
        isDarkMode: !state.isDarkMode,
        theme: state.isDarkMode ? lightTheme : darkTheme,
      };
    case 'SET_UPLOADING_MEDIA':
      return {
        ...state,
        isUploadingMedia: action.payload,
      };
    case 'SET_UPLOAD_PROGRESS':
      return {
        ...state,
        uploadProgress: action.payload,
      };
    default:
      return state;
  }
};

// Create a provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    isQRDetected: false,
    activeQRData: null,
    capturedMedia: [],
    theme: lightTheme,
    isDarkMode: false,
    isUploadingMedia: false,
    uploadProgress: 0,
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for accessing the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  const { state, dispatch } = context;
  
  // Create helper functions for common actions
  const setIsQRDetected = (isDetected: boolean) => {
    dispatch({ type: 'SET_QR_DETECTED', payload: isDetected });
  };
  
  const setActiveQRData = (data: QRCodeData | null) => {
    dispatch({ type: 'SET_ACTIVE_QR_DATA', payload: data });
  };
  
  const addCapturedMedia = (path: string, type: 'photo' | 'video') => {
    dispatch({
      type: 'ADD_CAPTURED_MEDIA',
      payload: { path, type },
    });
  };
  
  const removeCapturedMedia = (path: string) => {
    dispatch({ type: 'REMOVE_CAPTURED_MEDIA', payload: path });
  };
  
  const clearCapturedMedia = () => {
    dispatch({ type: 'CLEAR_CAPTURED_MEDIA' });
  };
  
  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };
  
  const setIsUploadingMedia = (isUploading: boolean) => {
    dispatch({ type: 'SET_UPLOADING_MEDIA', payload: isUploading });
  };
  
  const setUploadProgress = (progress: number) => {
    dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress });
  };
  
  return {
    ...state,
    setIsQRDetected,
    setActiveQRData,
    addCapturedMedia,
    removeCapturedMedia,
    clearCapturedMedia,
    toggleTheme,
    setIsUploadingMedia,
    setUploadProgress,
  };
};
