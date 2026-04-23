import { useState } from 'react';
import type { RemotionProjectJson } from './types';
import JsonEditor from './components/Editor/JsonEditor';
import ClipPropertiesPanel from './components/Editor/ClipPropertiesPanel';
import PreviewPlayer from './components/Player/PreviewPlayer';
import Timeline from './components/Timeline/Timeline';
import { AiGenModal } from './components/AI/AiGenModal';
import './App.css'; // Will create this

const initialData: RemotionProjectJson = {
// ... same as before

  fps: 30,
  durationInFrames: 600,
  width: 1280,
  height: 720,
  tracks: [
    {
      id: "track-video",
      name: "Main Video Track",
      clips: [
        {
          id: "intro-video",
          type: "video",
          sequenceProps: {
            from: 0, // Ignored in TransitionSeries but kept for typing
            durationInFrames: 150,
          },
          mediaProps: {
            src: "https://www.w3schools.com/html/mov_bbb.mp4",
            style: { width: '100%', height: '100%', objectFit: 'cover' },
            muted: true,
          },
          transitionToNext: 'fade',
          transitionDuration: 30,
          animations: [
            { type: 'blur', direction: 'in', durationInFrames: 30, value: 20 }
          ]
        },
        {
          id: "main-video",
          type: "video",
          sequenceProps: {
            from: 0,
            durationInFrames: 450,
          },
          mediaProps: {
            src: "https://www.w3schools.com/html/mov_bbb.mp4",
            style: { width: '100%', height: '100%', objectFit: 'cover' }
          },
          animations: [
            { type: 'fade', direction: 'out', durationInFrames: 30 }
          ]
        }
      ]
    },
    {
      id: "track-audio",
      name: "Background Music",
      clips: [
        {
          id: "bgm-1",
          type: "audio",
          sequenceProps: {
            from: 0,
            durationInFrames: 600,
          },
          mediaProps: {
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            volume: 0.5
          },
          animations: [
            { type: 'fade', direction: 'in', durationInFrames: 60 }
          ]
        }
      ]
    },
    {
      id: "track-overlay",
      name: "Watermark & Overlay",
      clips: [
        {
          id: "logo-img",
          type: "image",
          sequenceProps: {
            from: 0,
            durationInFrames: 540,
          },
          mediaProps: {
            src: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
            style: { position: 'absolute', top: 30, right: 30, width: 100, height: 100, opacity: 0.8 }
          },
          animations: [
            { type: 'fade', direction: 'both', durationInFrames: 30 }
          ]
        }
      ]
    }
  ]
};

function App() {
  const [projectData, setProjectData] = useState<RemotionProjectJson>(initialData);
  const [isRendering, setIsRendering] = useState(false);
  const [renderResult, setRenderResult] = useState<{ url: string; error?: string } | null>(null);
  
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'properties'>('properties');
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const handleRender = async () => {
    try {
      setIsRendering(true);
      setRenderResult(null);

      const response = await fetch('http://localhost:3000/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to render video');
      }

      setRenderResult({ url: `http://localhost:3000${data.downloadUrl}` });
    } catch (err: any) {
      setRenderResult({ url: '', error: err.message });
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="app-title">Remotion PoC Editor</h1>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {renderResult?.url && (
            <a href={renderResult.url} target="_blank" rel="noreferrer" style={{ color: '#22c55e', fontSize: '14px', textDecoration: 'none' }}>
              ✓ Download MP4
            </a>
          )}
          {renderResult?.error && (
            <span style={{ color: '#ef4444', fontSize: '14px' }}>Error: {renderResult.error}</span>
          )}
          
          <button 
            onClick={handleRender} 
            disabled={isRendering}
            style={{
              backgroundColor: isRendering ? '#4f46e5' : '#6366f1',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              opacity: isRendering ? 0.7 : 1,
              cursor: isRendering ? 'not-allowed' : 'pointer'
            }}
          >
            {isRendering ? 'Rendering...' : 'Render to MP4'}
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <aside className="left-panel glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--colorBorder)' }}>
            <button 
              onClick={() => setActiveTab('editor')}
              style={{ flex: 1, padding: '12px', background: activeTab === 'editor' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              JSON Editor
            </button>
            <button 
              onClick={() => setActiveTab('properties')}
              style={{ flex: 1, padding: '12px', background: activeTab === 'properties' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              Clip Properties
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '8px 12px',
              borderBottom: '1px solid var(--colorBorder)',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                color: '#e0e7ff',
                border: '1px solid rgba(99, 102, 241, 0.45)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              AI gen
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'editor' ? (
              <JsonEditor 
                value={projectData} 
                onChange={(newData) => setProjectData(newData)} 
              />
            ) : (
              <ClipPropertiesPanel 
                projectData={projectData}
                onChange={(newData) => setProjectData(newData)}
                selectedTrackId={selectedTrackId}
                selectedClipId={selectedClipId}
              />
            )}
          </div>
        </aside>
        
        <section className="right-panel">
          <div className="player-section glass-panel">
            <PreviewPlayer projectData={projectData} />
          </div>
          
          <div className="timeline-section glass-panel">
            <Timeline 
              projectData={projectData} 
              onChange={(newData) => setProjectData(newData)}
              onSelectClip={(trackId, clipId) => {
                setSelectedTrackId(trackId);
                setSelectedClipId(clipId);
                setActiveTab('properties');
              }}
              selectedClipId={selectedClipId}
            />
          </div>
        </section>
      </main>

      {aiModalOpen ? (
        <AiGenModal
          onClose={() => setAiModalOpen(false)}
          onApply={(data) => setProjectData(data)}
          currentProject={projectData}
        />
      ) : null}
    </div>
  );
}

export default App;
