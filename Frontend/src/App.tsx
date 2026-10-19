import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return (
    <View style={styles.appContainer}>
      <View style={styles.mobileFrame}>
        <AppNavigator />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mobileFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 512,
    alignSelf: 'center',
    backgroundColor: '#F8FAFC',
  },
});
