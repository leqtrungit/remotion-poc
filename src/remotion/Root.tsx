import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { MainComposition } from './MainComposition';
import type { RemotionProjectJson } from '../types';

// The default data to show if no props are passed
const defaultProps: RemotionProjectJson = {
  fps: 30,
  durationInFrames: 300,
  width: 1280,
  height: 720,
  tracks: []
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainComposition"
        component={MainComposition as any}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => {
          const p = props as unknown as RemotionProjectJson;
          return {
            durationInFrames: p.durationInFrames || 300,
            fps: p.fps || 30,
            width: p.width || 1280,
            height: p.height || 720,
          };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
