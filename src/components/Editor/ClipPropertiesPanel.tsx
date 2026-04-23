import React from 'react';
import type { RemotionProjectJson, Clip, Track, ClipAnimation } from '../../types';

interface ClipPropertiesPanelProps {
  projectData: RemotionProjectJson;
  onChange: (newData: RemotionProjectJson) => void;
  selectedTrackId: string | null;
  selectedClipId: string | null;
}

const ClipPropertiesPanel: React.FC<ClipPropertiesPanelProps> = ({
  projectData,
  onChange,
  selectedTrackId,
  selectedClipId,
}) => {
  if (!selectedTrackId || !selectedClipId) {
    return (
      <div style={{ padding: '16px', color: 'var(--colorTextSecondary)', textAlign: 'center' }}>
        Select a clip in the timeline to edit its properties.
      </div>
    );
  }

  const trackIndex = projectData.tracks.findIndex((t) => t.id === selectedTrackId);
  const track = projectData.tracks[trackIndex];
  const clipIndex = track?.clips.findIndex((c) => c.id === selectedClipId);
  const clip = track?.clips[clipIndex];

  if (!clip) return null;

  const updateClip = (updates: Partial<Clip>) => {
    const newTracks = [...projectData.tracks];
    const newClips = [...newTracks[trackIndex].clips];
    newClips[clipIndex] = { ...newClips[clipIndex], ...updates };
    newTracks[trackIndex] = { ...newTracks[trackIndex], clips: newClips };
    onChange({ ...projectData, tracks: newTracks });
  };

  const addAnimation = () => {
    const newAnim: ClipAnimation = { type: 'fade', direction: 'in', durationInFrames: 30 };
    updateClip({ animations: [...(clip.animations || []), newAnim] });
  };

  const updateAnimation = (index: number, updates: Partial<ClipAnimation>) => {
    const newAnimations = [...(clip.animations || [])];
    newAnimations[index] = { ...newAnimations[index], ...updates };
    updateClip({ animations: newAnimations });
  };

  const removeAnimation = (index: number) => {
    const newAnimations = [...(clip.animations || [])];
    newAnimations.splice(index, 1);
    updateClip({ animations: newAnimations });
  };

  return (
    <div style={{ padding: '16px', overflowY: 'auto', maxHeight: '100%' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--colorTextPrimary)' }}>
        Clip Properties: {clip.id}
      </h3>

      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--colorTextSecondary)' }}>Transition To Next</h4>
        <select
          value={clip.transitionToNext || 'none'}
          onChange={(e) => updateClip({ transitionToNext: e.target.value as any })}
          style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--colorBorder)' }}
        >
          <option value="none">None</option>
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
          <option value="wipe">Wipe</option>
        </select>

        {clip.transitionToNext && clip.transitionToNext !== 'none' && (
          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--colorTextSecondary)', marginBottom: '4px' }}>
              Duration (Frames)
            </label>
            <input
              type="number"
              value={clip.transitionDuration || 15}
              onChange={(e) => updateClip({ transitionDuration: parseInt(e.target.value) || 15 })}
              style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--colorBorder)' }}
            />
          </div>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ margin: 0, color: 'var(--colorTextSecondary)' }}>Animations (Fade/Blur)</h4>
          <button 
            onClick={addAnimation}
            style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            + Add
          </button>
        </div>

        {(clip.animations || []).length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'gray' }}>No animations.</p>
        ) : (
          clip.animations?.map((anim, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', marginBottom: '8px', border: '1px solid var(--colorBorder)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <select 
                  value={anim.type}
                  onChange={(e) => updateAnimation(idx, { type: e.target.value as any })}
                  style={{ flex: 1, padding: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--colorBorder)' }}
                >
                  <option value="fade">Fade</option>
                  <option value="blur">Blur</option>
                </select>
                
                <select 
                  value={anim.direction}
                  onChange={(e) => updateAnimation(idx, { direction: e.target.value as any })}
                  style={{ flex: 1, padding: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--colorBorder)' }}
                >
                  <option value="in">In</option>
                  <option value="out">Out</option>
                  <option value="both">Both</option>
                </select>
                
                <button 
                  onClick={() => removeAnimation(idx)}
                  style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 8px' }}
                >
                  X
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'gray' }}>Duration (Frames)</label>
                  <input 
                    type="number" 
                    value={anim.durationInFrames}
                    onChange={(e) => updateAnimation(idx, { durationInFrames: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--colorBorder)' }}
                  />
                </div>
                {anim.type === 'blur' && (
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'gray' }}>Max Blur (px)</label>
                    <input 
                      type="number" 
                      value={anim.value || 10}
                      onChange={(e) => updateAnimation(idx, { value: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--colorBorder)' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClipPropertiesPanel;
