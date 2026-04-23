import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import type { RemotionProjectJson, Clip } from '../types';
import { AnimatedClip } from './AnimatedClip';

const getTransitionPresentation = (type?: string) => {
  switch (type) {
    case 'slide': return slide();
    case 'wipe': return wipe();
    case 'fade': default: return fade();
  }
};

export const MainComposition: React.FC<any> = (props: RemotionProjectJson) => {
  const { tracks } = props;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {tracks.map((track) => (
        <AbsoluteFill key={track.id}>
          <TransitionSeries>
            {track.clips.map((clip: Clip<any>, index: number) => {
              const hasTransition = clip.transitionToNext && clip.transitionToNext !== 'none' && index < track.clips.length - 1;
              return (
                <React.Fragment key={clip.id}>
                  <TransitionSeries.Sequence durationInFrames={clip.sequenceProps.durationInFrames}>
                    <AnimatedClip clip={clip} />
                  </TransitionSeries.Sequence>
                  {hasTransition && (
                    <TransitionSeries.Transition
                      presentation={getTransitionPresentation(clip.transitionToNext)}
                      timing={linearTiming({ durationInFrames: clip.transitionDuration || 15 })}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </TransitionSeries>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
