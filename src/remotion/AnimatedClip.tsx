import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Video, Img, Audio } from 'remotion';
import type { Clip } from '../types';

interface AnimatedClipProps {
  clip: Clip;
}

export const AnimatedClip: React.FC<AnimatedClipProps> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: defaultDuration } = useVideoConfig();
  
  // Actually, we should use the duration of the clip itself for animations.
  // TransitionSeries.Sequence or Sequence sets the local context.
  const duration = clip.sequenceProps?.durationInFrames || defaultDuration;
  
  let opacity = 1;
  let blur = 0;

  if (clip.animations && clip.animations.length > 0) {
    clip.animations.forEach((anim) => {
      const { type, direction, durationInFrames, value } = anim;

      if (type === 'fade') {
        if (direction === 'in' || direction === 'both') {
          const fadeOpacity = interpolate(
            frame,
            [0, durationInFrames],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          opacity = Math.min(opacity, fadeOpacity);
        }
        if (direction === 'out' || direction === 'both') {
          const fadeOutOpacity = interpolate(
            frame,
            [duration - durationInFrames, duration],
            [1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          opacity = Math.min(opacity, fadeOutOpacity);
        }
      }

      if (type === 'blur') {
        const maxBlur = value || 10;
        if (direction === 'in' || direction === 'both') {
          const blurIn = interpolate(
            frame,
            [0, durationInFrames],
            [maxBlur, 0], // Start blurred, go to clear
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          blur = Math.max(blur, blurIn);
        }
        if (direction === 'out' || direction === 'both') {
          const blurOut = interpolate(
            frame,
            [duration - durationInFrames, duration],
            [0, maxBlur], // Start clear, go to blurred
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          blur = Math.max(blur, blurOut);
        }
      }
    });
  }

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity,
    filter: blur > 0 ? `blur(${blur}px)` : 'none',
  };

  return (
    <div style={containerStyle}>
      {clip.type === 'video' && <Video {...(clip.mediaProps as any)} />}
      {clip.type === 'image' && <Img {...(clip.mediaProps as any)} />}
      {clip.type === 'audio' && <Audio {...(clip.mediaProps as any)} />}
    </div>
  );
};
