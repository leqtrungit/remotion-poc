import React from 'react';
import type { RemotionProjectJson, Track, Clip } from '../../types';
import './Timeline.css';

interface TimelineProps {
  projectData: RemotionProjectJson;
}

const Timeline: React.FC<TimelineProps> = ({ projectData }) => {
  const { durationInFrames, tracks } = projectData;

  // Render a clip block
  const renderClip = (clip: Clip<any>) => {
    const fromFrame = clip.sequenceProps.from ?? 0;
    const clipDuration = clip.sequenceProps.durationInFrames ?? durationInFrames;
    const leftPercent = (fromFrame / durationInFrames) * 100;
    const widthPercent = (clipDuration / durationInFrames) * 100;

    return (
      <div 
        key={clip.id} 
        className="timeline-clip"
        style={{
          left: `${leftPercent}%`,
          width: `${widthPercent}%`
        }}
        title={`[${clip.type}] ${clip.id}\nFrames: ${fromFrame} - ${fromFrame + clipDuration}`}
      >
        <span className="clip-label">{clip.id}</span>
      </div>
    );
  };

  // Render a track row
  const renderTrack = (track: Track) => {
    return (
      <div key={track.id} className="timeline-track-row">
        <div className="track-header">
          <span className="track-name">{track.name || track.id}</span>
        </div>
        <div className="track-clips-area">
          {track.clips.map(renderClip)}
        </div>
      </div>
    );
  };

  return (
    <div className="timeline-container">
      <div className="timeline-header-bar">
        <div className="timeline-header-spacer">Tracks</div>
        <div className="timeline-ruler">
          {/* Simple ruler ticks */}
          {[...Array(11)].map((_, i) => (
            <div key={i} className="ruler-tick" style={{ left: `${i * 10}%` }}>
              {Math.round((durationInFrames / 10) * i)}
            </div>
          ))}
        </div>
      </div>
      <div className="timeline-tracks-container">
        {tracks.map(renderTrack)}
      </div>
    </div>
  );
};

export default Timeline;
