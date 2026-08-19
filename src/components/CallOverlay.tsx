import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, MicOff, Video, VideoOff, PhoneOff, PhoneCall } from 'lucide-react-native';
import { RTCView, isWebRTCAvailable } from '../utils/safeWebRTC';

const GREEN = '#063B28';

type CallState = {
  callId: string;
  type: 'voice' | 'video';
  name: string;
  status: 'outgoing' | 'incoming' | 'active';
  otherUserId: number | null;
};

interface Props {
  callState: CallState;
  localStream: any;
  remoteStream: any;
  muted: boolean;
  cameraOff: boolean;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export default function CallOverlay({
  callState, localStream, remoteStream, muted, cameraOff,
  onAccept, onReject, onEnd, onToggleMute, onToggleCamera,
}: Props) {
  const isVideo = callState.type === 'video' && isWebRTCAvailable;
  const showVideoStreams = isVideo && callState.status === 'active';

  return (
    <View style={styles.overlay}>
      {showVideoStreams && remoteStream && (
        <RTCView streamURL={remoteStream.toURL?.()} style={StyleSheet.absoluteFill} objectFit="cover" />
      )}

      <LinearGradient
        colors={showVideoStreams ? ['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)'] : [GREEN, '#021a10']}
        style={showVideoStreams ? styles.videoScrim : styles.card}
      >
        {!showVideoStreams && (
          <>
            <Text style={styles.type}>{callState.type === 'video' ? '📹 Video Call' : '📞 Voice Call'}</Text>
            <Text style={styles.name}>{callState.name}</Text>
            <Text style={styles.status}>
              {!isWebRTCAvailable ? 'Calling requires a rebuilt app (dev client)' :
               callState.status === 'outgoing' ? 'Calling...' :
               callState.status === 'incoming' ? 'Incoming call' : 'Call in progress'}
            </Text>
            {callState.status === 'active' && <Text style={styles.connected}>Connected</Text>}
          </>
        )}

        {showVideoStreams && localStream && (
          <View style={styles.localVideoWrap}>
            <RTCView streamURL={localStream.toURL?.()} style={styles.localVideo} objectFit="cover" mirror />
          </View>
        )}

        <View style={styles.btns}>
          {callState.status === 'incoming' && (
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#22c55e' }]} onPress={onAccept}>
              <PhoneCall size={26} color="#fff" />
              <Text style={styles.btnLabel}>Accept</Text>
            </TouchableOpacity>
          )}
          {callState.status === 'active' && (
            <>
              <TouchableOpacity style={[styles.btn, styles.btnSmall, muted && styles.btnActive]} onPress={onToggleMute}>
                {muted ? <MicOff size={22} color="#fff" /> : <Mic size={22} color="#fff" />}
              </TouchableOpacity>
              {callState.type === 'video' && (
                <TouchableOpacity style={[styles.btn, styles.btnSmall, cameraOff && styles.btnActive]} onPress={onToggleCamera}>
                  {cameraOff ? <VideoOff size={22} color="#fff" /> : <Video size={22} color="#fff" />}
                </TouchableOpacity>
              )}
            </>
          )}
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#ef4444' }]} onPress={callState.status === 'incoming' ? onReject : onEnd}>
            <PhoneOff size={26} color="#fff" />
            <Text style={styles.btnLabel}>{callState.status === 'incoming' ? 'Decline' : 'End'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:        { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  card:           { width: '80%', borderRadius: 24, padding: 32, alignItems: 'center', gap: 8 },
  videoScrim:     { position: 'absolute', inset: 0, justifyContent: 'space-between', paddingVertical: 60, alignItems: 'center' },
  type:           { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  name:           { color: '#fff', fontSize: 24, fontWeight: '900' },
  status:         { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center' },
  connected:      { color: '#22c55e', fontWeight: '700', marginTop: 4 },
  localVideoWrap: { position: 'absolute', top: 60, right: 20, width: 100, height: 140, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  localVideo:     { width: '100%', height: '100%' },
  btns:           { flexDirection: 'row', gap: 20, marginTop: 24 },
  btn:            { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
  btnSmall:       { width: 52, height: 52, borderRadius: 26 },
  btnActive:      { backgroundColor: 'rgba(239,68,68,0.85)' },
  btnLabel:       { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 4 },
});
