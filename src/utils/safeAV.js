import React from 'react';
import { View } from 'react-native';

let ExpoAV = null;

try {
  ExpoAV = require('expo-av');
} catch (e) {}

export const Audio = ExpoAV?.Audio || {
  Sound: {
    createAsync: async () => ({ sound: { playAsync: async () => {}, stopAsync: async () => {}, unloadAsync: async () => {}, setPositionAsync: async () => {}, getStatusAsync: async () => ({}) } }),
  },
  Recording: {
    createAsync: async () => ({ recording: { stopAndUnloadAsync: async () => {}, getURI: () => '' } }),
  },
  setAudioModeAsync: async () => {},
  InterruptionModeAndroid: { DoNotMix: 1 },
  InterruptionModeIOS: { DoNotMix: 1 },
};

const _FallbackVideo = React.forwardRef((props, ref) =>
  React.createElement(View, { ...props, ref })
);
_FallbackVideo.displayName = 'Video';
export const Video = ExpoAV?.Video || _FallbackVideo;

export const ResizeMode = ExpoAV?.ResizeMode || { CONTAIN: 'contain', COVER: 'cover' };
