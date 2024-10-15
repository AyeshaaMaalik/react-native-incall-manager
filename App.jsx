
import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import InCallManager from 'react-native-incall-manager';

const App = () => {

  useEffect(() => {
    InCallManager.start({ media: 'audio' });

    return () => {
      InCallManager.stop();
    };
  }, []);

  const startCall = () => {
    InCallManager.startRingtone('_BUNDLE_');
  };

  const endCall = () => {
    InCallManager.stopRingtone();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>InCallManager Demo</Text>
      <Button title="Simulate Start Call" onPress={startCall} />
      <Button title="Simulate End Call" onPress={endCall} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default App;
