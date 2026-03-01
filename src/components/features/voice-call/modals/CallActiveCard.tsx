/**
 * CallActiveCard Component
 * Active call UI with connecting state
 */

import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import type { CallState, CallStatus } from '@/types/models';

interface CallActiveCardProps {
  callState: CallState;
  callStatus: CallStatus;
  callDuration: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
}

export const CallActiveCard = ({
  callState,
  callStatus,
  callDuration,
  isMuted,
  onToggleMute,
  onEndCall,
}: CallActiveCardProps) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Connecting State - NEW!
  if (callState === 'connecting') {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-[9996]" />

        <div className="fixed bottom-6 left-6 z-[9997] bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-[#0066FF] w-[280px]">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Connecting to Sophia...
              </span>
            </div>

            <div className="flex items-center justify-center gap-1 h-16">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-[#0066FF] rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: '20px',
                  }}
                />
              ))}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              This usually takes 2-3 seconds
            </p>
            <p className="text-xs text-gray-500">
              Please allow microphone access if prompted
            </p>

            <Button
              onClick={onEndCall}
              variant="outline"
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Connected State
  if (callState === 'connected') {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-[9996]" />

        <div className="fixed bottom-6 left-6 z-[9997] bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border-2 border-[#0066FF] animate-pulse-glow w-[280px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Connected to Sophia
              </span>
            </div>

            <div className="flex items-center justify-center gap-1 h-16">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-[#0066FF] rounded-full animate-waveform"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: '20px',
                  }}
                />
              ))}
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                {callStatus === 'speaking' ? (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Sophia is speaking...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-green-500" />
                    <span>Listening to you...</span>
                  </>
                )}
              </div>
              <div className="text-2xl font-mono text-gray-900 dark:text-white">
                {formatTime(callDuration)}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onToggleMute}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                onClick={onEndCall}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </Button>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes waveform {
            0%, 100% { height: 8px; }
            50% { height: 32px; }
          }

          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 102, 255, 0.3); }
            50% { box-shadow: 0 0 40px rgba(0, 102, 255, 0.6); }
          }

          .animate-waveform {
            animation: waveform 1s ease-in-out infinite;
          }

          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}</style>
      </>
    );
  }

  return null;
};
