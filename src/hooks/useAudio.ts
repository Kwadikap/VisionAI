/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react';
import { startAudioPlayerWorklet } from '../lib/audio-player.js';
import { startAudioRecorderWorklet } from '../lib/audio-recorder.js';
import { MessageType } from '@/components/chat-ui/types';
import { arrayBufferToBase64 } from '@/lib/utils.js';

interface AudioPlayerProps {
  sendMessage: (message: { type: MessageType; data: any }) => void;
}

export function useAudio({ sendMessage }: AudioPlayerProps) {
  // Player/recorder refs persist across renders and are visible to other hooks
  const audioPlayerNode = useRef<any>(null);
  const audioPlayerContext = useRef<any>(null);
  const audioRecorderNode = useRef<any>(null);
  const audioRecorderContext = useRef<any>(null);
  const micStream = useRef<any>(null);

  // Audio buffering for 0.2s intervals
  let audioBuffer: Uint8Array[] = [];
  let bufferTimer: any = null;

  // Start audio
  async function startAudio() {
    console.log('Starting audio stream');
    // Start audio output
    await startAudioPlayerWorklet().then(([node, ctx]) => {
      audioPlayerNode.current = node;
      audioPlayerContext.current = ctx;
    });
    // Start audio input
    await startAudioRecorderWorklet(audioRecorderHandler).then(
      ([node, ctx, stream]) => {
        audioRecorderNode.current = node;
        audioRecorderContext.current = ctx;
        micStream.current = stream;
      }
    );
  }

  // Send buffered audio data every 0.2 seconds
  function sendBufferedAudio() {
    if (audioBuffer.length === 0) {
      return;
    }

    // Calculate total length
    let totalLength = 0;
    for (const chunk of audioBuffer) {
      totalLength += chunk.length;
    }

    // Combine all chunks into a single buffer
    const combinedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioBuffer) {
      combinedBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Send the combined audio data
    sendMessage({
      type: MessageType.audio,
      data: arrayBufferToBase64(combinedBuffer.buffer),
    });

    // Clear the buffer
    audioBuffer = [];
  }

  // Audio recorder handler
  // Audio recorder handler
  function audioRecorderHandler(pcmData: any) {
    // Add audio data to buffer
    audioBuffer.push(new Uint8Array(pcmData));

    // Start timer if not already running
    if (!bufferTimer) {
      bufferTimer = setInterval(sendBufferedAudio, 200); // 0.2 seconds
    }
  }

  // Stop audio recording and cleanup
  function stopAudioRecording() {
    if (bufferTimer) {
      clearInterval(bufferTimer);
      bufferTimer = null;
    }

    // Send any remaining buffered audio
    if (audioBuffer.length > 0) {
      sendBufferedAudio();
    }
  }

  return {
    audioPlayerNode,
    startAudio,
    stopAudioRecording,
  };
}
