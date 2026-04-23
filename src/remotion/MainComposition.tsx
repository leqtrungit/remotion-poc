import React from 'react';
import { AbsoluteFill, Sequence, Video, Img, Audio } from 'remotion';
import type { RemotionProjectJson, Clip } from '../types';

export const MainComposition: React.FC<any> = (props: RemotionProjectJson) => {
  const { tracks } = props;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {tracks.map((track) => (
        <AbsoluteFill key={track.id}>
          {track.clips.map((clip: Clip<any>) => (
            <Sequence
              key={clip.id}
              {...(clip.sequenceProps as any)}
            >
              <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                {clip.type === 'video' && <Video {...(clip.mediaProps as any)} />}
                {clip.type === 'image' && <Img {...(clip.mediaProps as any)} />}
                {clip.type === 'audio' && <Audio {...(clip.mediaProps as any)} />}
              </AbsoluteFill>
            </Sequence>
          ))}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
