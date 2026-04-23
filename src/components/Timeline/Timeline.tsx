import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { RemotionProjectJson, Track, Clip } from '../../types';
import './Timeline.css';

interface TimelineProps {
  projectData: RemotionProjectJson;
  onChange?: (newData: RemotionProjectJson) => void;
  onSelectClip?: (trackId: string, clipId: string) => void;
  selectedClipId?: string | null;
}

const Timeline: React.FC<TimelineProps> = ({ projectData, onChange, onSelectClip, selectedClipId }) => {
  const { durationInFrames, tracks } = projectData;

  const handleDragEnd = (result: DropResult) => {
    if (!onChange) return;
    const { source, destination, type } = result;

    if (!destination) return;

    const newTracks = Array.from(tracks);

    if (type === 'TRACK') {
      const [movedTrack] = newTracks.splice(source.index, 1);
      newTracks.splice(destination.index, 0, movedTrack);
    } else if (type === 'CLIP') {
      const sourceTrackIndex = newTracks.findIndex(t => t.id === source.droppableId);
      const destTrackIndex = newTracks.findIndex(t => t.id === destination.droppableId);

      if (sourceTrackIndex !== -1 && destTrackIndex !== -1) {
        const sourceClips = Array.from(newTracks[sourceTrackIndex].clips);
        const [movedClip] = sourceClips.splice(source.index, 1);
        
        if (sourceTrackIndex === destTrackIndex) {
          sourceClips.splice(destination.index, 0, movedClip);
          newTracks[sourceTrackIndex] = { ...newTracks[sourceTrackIndex], clips: sourceClips };
        } else {
          const destClips = Array.from(newTracks[destTrackIndex].clips);
          destClips.splice(destination.index, 0, movedClip);
          newTracks[sourceTrackIndex] = { ...newTracks[sourceTrackIndex], clips: sourceClips };
          newTracks[destTrackIndex] = { ...newTracks[destTrackIndex], clips: destClips };
        }
      }
    }

    onChange({ ...projectData, tracks: newTracks });
  };

  const renderClip = (trackId: string, clip: Clip<any>, index: number, previousClipsDuration: number) => {
    const clipDuration = clip.sequenceProps.durationInFrames ?? durationInFrames;
    const widthPercent = (clipDuration / durationInFrames) * 100;
    const isSelected = clip.id === selectedClipId;

    return (
      <Draggable key={clip.id} draggableId={clip.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`timeline-clip ${snapshot.isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
            style={{
              ...provided.draggableProps.style,
              width: `${widthPercent}%`,
              flexShrink: 0,
              boxShadow: isSelected ? '0 0 0 2px #4f46e5' : undefined,
            }}
            title={`[${clip.type}] ${clip.id}\nDuration: ${clipDuration}`}
            onClick={() => onSelectClip && onSelectClip(trackId, clip.id)}
          >
            <span className="clip-label">{clip.id}</span>
          </div>
        )}
      </Draggable>
    );
  };

  const renderTrack = (track: Track, trackIndex: number) => {
    return (
      <Draggable key={track.id} draggableId={track.id} index={trackIndex}>
        {(providedTrack, snapshotTrack) => (
          <div
            ref={providedTrack.innerRef}
            {...providedTrack.draggableProps}
            className={`timeline-track-row ${snapshotTrack.isDragging ? 'dragging-track' : ''}`}
            style={{
              ...providedTrack.draggableProps.style,
            }}
          >
            <div className="track-header" {...providedTrack.dragHandleProps}>
              <span className="track-name">☰ {track.name || track.id}</span>
            </div>
            
            <Droppable droppableId={track.id} type="CLIP" direction="horizontal">
              {(providedClipDroppable, snapshotClipDroppable) => (
                <div 
                  className={`track-clips-area flex-row-clips ${snapshotClipDroppable.isDraggingOver ? 'drag-over' : ''}`}
                  ref={providedClipDroppable.innerRef}
                  {...providedClipDroppable.droppableProps}
                  style={{ display: 'flex', position: 'relative' }}
                >
                  {track.clips.map((clip, index) => {
                    const previousDuration = track.clips
                      .slice(0, index)
                      .reduce((acc, curr) => acc + (curr.sequenceProps.durationInFrames || 0), 0);
                    return renderClip(track.id, clip, index, previousDuration);
                  })}
                  {providedClipDroppable.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="timeline-container">
        <div className="timeline-header-bar">
          <div className="timeline-header-spacer">Tracks</div>
          <div className="timeline-ruler">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="ruler-tick" style={{ left: `${i * 10}%` }}>
                {Math.round((durationInFrames / 10) * i)}
              </div>
            ))}
          </div>
        </div>
        
        <Droppable droppableId="board" type="TRACK" direction="vertical">
          {(provided, snapshot) => (
            <div 
              className="timeline-tracks-container"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tracks.map(renderTrack)}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default Timeline;
