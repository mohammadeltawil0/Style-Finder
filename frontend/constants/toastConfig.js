import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useTheme } from "@react-navigation/native";

export const useToastConfig = () => {
  const theme = useTheme();

  return {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: theme.colors.success, backgroundColor: '#f0fdf4' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}
        text2Style={{ color: theme.colors.text, fontSize: 13 }}
      />
    ),

    error: (props) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: theme.colors.error, backgroundColor: '#fef2f2' }}
        text1Style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}
        text2Style={{ color: theme.colors.text, fontSize: 13 }}
      />
    ),

    info: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: theme.colors.info, backgroundColor: '#eff6ff' }}
        text1Style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}
        text2Style={{ color: theme.colors.text, fontSize: 13 }}
      />
    ),
  };
};