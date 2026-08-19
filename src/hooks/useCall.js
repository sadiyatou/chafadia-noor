import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import api from '../api/client';
import {
  RTCPeerConnection, RTCIceCandidate, RTCSessionDescription,
  mediaDevices, isWebRTCAvailable,
} from '../utils/safeWebRTC';

const DEFAULT_ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

// Owns the RTCPeerConnection + local/remote media streams for one call at a
// time, and drives itself off the same socket the chat screen already
// connects with `socket.io-client` (see server/config/socket.js for the
// signaling events this mirrors: call:initiate/accept/reject/end,
// call:sdp-offer/sdp-answer/ice-candidate).
//
// `attachSocket` is only called once, right after the socket connects, so
// every handler below reads mutable state through refs (callStateRef,
// currentUserRef) rather than through useCallback dependencies — otherwise
// the socket listeners would close over stale state forever.
export default function useCall(currentUser) {
  const [callState, setCallStateRaw] = useState(null); // { callId, type, name, status: outgoing|incoming|active, otherUserId }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const callStateRef = useRef(null);
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const setCallState = useCallback((next) => {
    const resolved = typeof next === 'function' ? next(callStateRef.current) : next;
    callStateRef.current = resolved;
    setCallStateRaw(resolved);
  }, []);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidates = useRef([]);
  const iceServersRef = useRef(DEFAULT_ICE_SERVERS);
  const roleRef = useRef(null); // 'caller' | 'callee'

  const fetchIceServers = useCallback(async () => {
    try {
      const { data } = await api.get('/calls/ice-servers');
      if (data.success && data.iceServers?.length) iceServersRef.current = data.iceServers;
    } catch {
      // fall back to public STUN silently — calls still work on many networks
    }
  }, []);

  const cleanup = useCallback(() => {
    try { localStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    localStreamRef.current = null;
    pendingCandidates.current = [];
    roleRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setMuted(false);
    setCameraOff(false);
    setCallState(null);
  }, [setCallState]);

  const createPeerConnection = useCallback((toUserId, callId) => {
    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('call:ice-candidate', { callId, toUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams?.[0]) setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      // A hard failure cleans up locally; a normal hangup arrives via the
      // explicit call:ended signal instead, so it's handled by onEnded.
      if (pc.connectionState === 'failed') cleanup();
    };

    pcRef.current = pc;
    return pc;
  }, [cleanup]);

  const getLocalMedia = useCallback(async (video) => {
    const stream = await mediaDevices.getUserMedia({ audio: true, video: video ? { facingMode: 'user' } : false });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  // ── Outgoing ──
  const startCall = useCallback(async (type, toUserId, name, chatId) => {
    if (!isWebRTCAvailable) {
      Alert.alert('Calls unavailable', 'This build does not include native calling support yet. Rebuild the app with a dev client to enable voice/video calls.');
      return;
    }
    if (!toUserId || !currentUserRef.current) return;

    const callId = `call_${Date.now()}`;
    roleRef.current = 'caller';
    setCallState({ callId, type, name, status: 'outgoing', otherUserId: toUserId });

    await fetchIceServers();
    socketRef.current?.emit('call:initiate', {
      toUserId, callId, callType: type, callerName: currentUserRef.current.fullName, chatId,
    });
  }, [fetchIceServers, setCallState]);

  // ── Incoming ──
  const onIncoming = useCallback(({ callId, callType, fromUserId, callerName }) => {
    roleRef.current = 'callee';
    setCallState({ callId, type: callType, name: callerName, status: 'incoming', otherUserId: fromUserId });
  }, [setCallState]);

  const acceptCall = useCallback(async () => {
    const cs = callStateRef.current;
    if (!cs) return;
    if (!isWebRTCAvailable) {
      Alert.alert('Calls unavailable', 'This build does not include native calling support yet.');
      socketRef.current?.emit('call:reject', { callId: cs.callId, toUserId: cs.otherUserId });
      cleanup();
      return;
    }
    try {
      await fetchIceServers();
      const stream = await getLocalMedia(cs.type === 'video');
      const pc = createPeerConnection(cs.otherUserId, cs.callId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      setCallState(prev => prev ? { ...prev, status: 'active' } : prev);
      socketRef.current?.emit('call:accept', { callId: cs.callId, toUserId: cs.otherUserId });
    } catch {
      Alert.alert('Call error', 'Could not access camera/microphone.');
      socketRef.current?.emit('call:reject', { callId: cs.callId, toUserId: cs.otherUserId });
      cleanup();
    }
  }, [createPeerConnection, getLocalMedia, fetchIceServers, cleanup, setCallState]);

  const rejectCall = useCallback(() => {
    const cs = callStateRef.current;
    if (!cs) return;
    socketRef.current?.emit('call:reject', { callId: cs.callId, toUserId: cs.otherUserId });
    cleanup();
  }, [cleanup]);

  const endCall = useCallback(() => {
    const cs = callStateRef.current;
    if (!cs) return;
    socketRef.current?.emit('call:end', { callId: cs.callId, toUserId: cs.otherUserId });
    cleanup();
  }, [cleanup]);

  // ── Signaling responses (caller side becomes active once callee accepts) ──
  const onAccepted = useCallback(async () => {
    const cs = callStateRef.current;
    if (roleRef.current !== 'caller' || !cs) return;
    try {
      const stream = await getLocalMedia(cs.type === 'video');
      const pc = createPeerConnection(cs.otherUserId, cs.callId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('call:sdp-offer', { callId: cs.callId, toUserId: cs.otherUserId, sdp: offer });

      setCallState(prev => prev ? { ...prev, status: 'active' } : prev);
    } catch {
      Alert.alert('Call error', 'Could not access camera/microphone.');
      endCall();
    }
  }, [createPeerConnection, getLocalMedia, endCall, setCallState]);

  const onRejected = useCallback(() => {
    Alert.alert('Call declined', 'The other person declined your call.');
    cleanup();
  }, [cleanup]);

  const onEnded = useCallback(() => { cleanup(); }, [cleanup]);

  const onSdpOffer = useCallback(async ({ sdp }) => {
    const pc = pcRef.current;
    const cs = callStateRef.current;
    if (!pc || !cs) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    for (const c of pendingCandidates.current) await pc.addIceCandidate(new RTCIceCandidate(c));
    pendingCandidates.current = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current?.emit('call:sdp-answer', { callId: cs.callId, toUserId: cs.otherUserId, sdp: answer });
  }, []);

  const onSdpAnswer = useCallback(async ({ sdp }) => {
    const pc = pcRef.current;
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    for (const c of pendingCandidates.current) await pc.addIceCandidate(new RTCIceCandidate(c));
    pendingCandidates.current = [];
  }, []);

  const onIceCandidate = useCallback(async ({ candidate }) => {
    const pc = pcRef.current;
    if (!candidate) return;
    if (!pc || !pc.remoteDescription) {
      pendingCandidates.current.push(candidate);
      return;
    }
    try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
  }, []);

  // Called once from the screen's socket-setup effect, right after the socket connects.
  const attachSocket = useCallback((socket) => {
    socketRef.current = socket;
    socket.on('call:incoming', onIncoming);
    socket.on('call:accepted', onAccepted);
    socket.on('call:rejected', onRejected);
    socket.on('call:ended', onEnded);
    socket.on('call:sdp-offer', onSdpOffer);
    socket.on('call:sdp-answer', onSdpAnswer);
    socket.on('call:ice-candidate', onIceCandidate);
  }, [onIncoming, onAccepted, onRejected, onEnded, onSdpOffer, onSdpAnswer, onIceCandidate]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const tracks = stream.getAudioTracks();
    if (!tracks.length) return;
    const wasEnabled = tracks[0].enabled;
    tracks.forEach(t => { t.enabled = !t.enabled; });
    setMuted(wasEnabled); // was enabled (unmuted) → now disabled → muted = true
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const tracks = stream.getVideoTracks();
    if (!tracks.length) return;
    const wasEnabled = tracks[0].enabled;
    tracks.forEach(t => { t.enabled = !t.enabled; });
    setCameraOff(wasEnabled); // was enabled (camera on) → now disabled → cameraOff = true
  }, []);

  // If the screen using this hook unmounts mid-call (e.g. user navigates
  // away), close the peer connection/tracks instead of leaking them.
  useEffect(() => () => {
    try { localStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    try { pcRef.current?.close(); } catch {}
  }, []);

  return {
    callState, localStream, remoteStream, muted, cameraOff,
    attachSocket, startCall, acceptCall, rejectCall, endCall,
    toggleMute, toggleCamera,
  };
}
