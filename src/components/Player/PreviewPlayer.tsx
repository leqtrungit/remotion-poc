import React from 'react';
import { Player } from '@remotion/player';
import type { RemotionProjectJson } from '../../types';
import { MainComposition } from '../../remotion/MainComposition';
import './PreviewPlayer.css';

interface PreviewPlayerProps {
  projectData: RemotionProjectJson;
}

const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ projectData }) => {
  return (
    <div className="player-wrapper">
      <Player
        component={MainComposition}
        inputProps={projectData}
        durationInFrames={Math.max(1, projectData.durationInFrames)} // Ensure non-zero
        compositionWidth={projectData.width || 1280}
        compositionHeight={projectData.height || 720}
        fps={projectData.fps || 30}
        style={{
          width: '100%',
          height: '100%',
        }}
        controls
        autoPlay
        loop
      />
    </div>
  );
};

export default PreviewPlayer;
