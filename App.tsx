import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { ConfigProvider, useConfig } from './src/context/ConfigContext';
import MaintenanceScreen from './src/screens/system/MaintenanceScreen';

const queryClient = new QueryClient();

function MainApp() {
  const { config } = useConfig();
  
  if (config.isUnderMaintenance) {
    return <MaintenanceScreen />;
  }

  return <AppNavigator />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ConfigProvider>
          <MainApp />
        </ConfigProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
