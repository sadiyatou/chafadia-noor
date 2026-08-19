import React from 'react';
import { View } from 'react-native';

// react-native-webrtc is a native module — it does not exist inside Expo Go
// and only becomes available after `npx expo prebuild` + a dev-client/native
// build. Guard the require so the rest of the app (and this screen) doesn't
// crash before that build has been done; isWebRTCAvailable lets the UI show
// a clear message instead.
let WebRTC = null;
try {
  WebRTC = require('react-native-webrtc');
} catch (e) {}

export const isWebRTCAvailable = !!WebRTC;

class NoopPeerConnection {
  createOffer() { return Promise.resolve({}); }
  createAnswer() { return Promise.resolve({}); }
  setLocalDescription() { return Promise.resolve(); }
  setRemoteDescription() { return Promise.resolve(); }
  addIceCandidate() { return Promise.resolve(); }
  addTrack() {}
  close() {}
}

export const RTCPeerConnection   = WebRTC?.RTCPeerConnection || NoopPeerConnection;
export const RTCIceCandidate     = WebRTC?.RTCIceCandidate || function (init) { return init; };
export const RTCSessionDescription = WebRTC?.RTCSessionDescription || function (init) { return init; };
export const mediaDevices = WebRTC?.mediaDevices || {
  getUserMedia: async () => { throw new Error('WebRTC not available in this build — rebuild the app with a dev client.'); },
};

const _FallbackRTCView = React.forwardRef((props, ref) => React.createElement(View, { ...props, ref }));
_FallbackRTCView.displayName = 'RTCView';
export const RTCView = WebRTC?.RTCView || _FallbackRTCView;
export const mediaDevicesRegisterGlobals = WebRTC?.registerGlobals || (() => {});
