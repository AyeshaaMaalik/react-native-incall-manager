import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { RTCView, mediaDevices } from 'react-native-webrtc';

const App = () => {
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const localVideoRef = useRef(null);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        return (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
      return true;
    } catch (err) {
      console.warn('Permission request failed:', err);
      return false;
    }
  };

  const startCall = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      console.error('Permissions not granted.');
      return;
    }

    try {
      InCallManager.startRingtone('_BUNDLE_');

      const localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          frameRate: 30,
          facingMode: isFrontCamera ? 'user' : 'environment',
        },
      });

      setStream(localStream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  };

  const endCall = () => {
    InCallManager.stopRingtone();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const switchCamera = async () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const facingMode = isFrontCamera ? 'environment' : 'user';
      const newStream = await mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode },
      });
      videoTrack.stop(); 
      setStream(newStream); 

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
      setIsFrontCamera(!isFrontCamera);
    }
  };

  useEffect(() => {
    InCallManager.start({ media: 'video' });

    return () => {
      InCallManager.stop();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>InCallManager Video Call Demo</Text>

      {stream && (
        <RTCView
          streamURL={stream.toURL()}
          style={styles.video}
          ref={localVideoRef}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Start Video Call" onPress={startCall} />
        <Button title="End Call" onPress={endCall} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title={isMuted ? "Unmute" : "Mute"} onPress={toggleMute} />
        <Button title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"} onPress={toggleCamera} />
        <Button title="Switch Camera" onPress={switchCamera} />
      </View>
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
  video: {
    width: '100%',
    height: 400,
    backgroundColor: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
});

export default App;
