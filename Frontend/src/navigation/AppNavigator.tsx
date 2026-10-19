import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { Header } from '../components/common/Header';
import { AuthPage } from '../pages/AuthPage';
import { DriverDashboardPage } from '../pages/DriverDashboardPage';
import { TechnicianDashboardPage } from '../pages/TechnicianDashboardPage';

export const AppNavigator: React.FC = () => {
  const { user, currentRole, switchRole, loginSuccess, logout } = useAuth();
  const { isOffline, toggleOffline, offlineQueueCount, triggerSync, syncResult } = useOfflineSync();
  const [isNightMode, setIsNightMode] = useState<boolean>(false);

  if (!user) {
    return <AuthPage onLoginSuccess={loginSuccess} />;
  }

  const colors = {
    bg: isNightMode ? '#0F172A' : '#F8FAFC',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header
        user={user}
        currentRole={currentRole}
        onSwitchRole={switchRole}
        isOffline={isOffline}
        onToggleOffline={toggleOffline}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode(prev => !prev)}
        onLogout={logout}
        offlineCount={offlineQueueCount}
        onSyncOffline={triggerSync}
        syncMessage={syncResult}
      />

      <View style={styles.content}>
        {currentRole === 'driver' ? (
          <DriverDashboardPage user={user} isNightMode={isNightMode} isOffline={isOffline} />
        ) : (
          <TechnicianDashboardPage user={user} isNightMode={isNightMode} isOffline={isOffline} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
