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
        // When rendering dynamically, calculateMetadata can be used, but since we 
        // pass the entire JSON as inputProps, we can just let duration/fps be overriden by renderMedia()
      />
    </>
  );
};

registerRoot(RemotionRoot);
