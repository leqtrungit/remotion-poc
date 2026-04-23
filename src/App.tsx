import { useState } from 'react';
import type { RemotionProjectJson } from './types';
import JsonEditor from './components/Editor/JsonEditor';
import PreviewPlayer from './components/Player/PreviewPlayer';
import Timeline from './components/Timeline/Timeline';
import './App.css'; // Will create this

const initialData: RemotionProjectJson = {
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
            from: 0,
            durationInFrames: 150,
          },
          mediaProps: {
            src: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
            style: { width: '100%', height: '100%', objectFit: 'cover' },
            muted: true,
          }
        },
        {
          id: "main-video",
          type: "video",
          sequenceProps: {
            from: 150,
            durationInFrames: 450,
          },
          mediaProps: {
            src: "https://www.w3schools.com/html/mov_bbb.mp4",
            style: { width: '100%', height: '100%', objectFit: 'cover' }
          }
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
          }
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
            from: 60,
            durationInFrames: 540,
          },
          mediaProps: {
            src: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
            style: { position: 'absolute', top: 30, right: 30, width: 100, height: 100, opacity: 0.8 }
          }
        }
      ]
    }
  ]
};

function App() {
  const [projectData, setProjectData] = useState<RemotionProjectJson>(initialData);

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <h1 className="app-title">Remotion PoC Editor</h1>
      </header>
      
      <main className="app-main">
        <aside className="left-panel glass-panel">
          <JsonEditor 
            value={projectData} 
            onChange={(newData) => setProjectData(newData)} 
          />
        </aside>
        
        <section className="right-panel">
          <div className="player-section glass-panel">
            <PreviewPlayer projectData={projectData} />
          </div>
          
          <div className="timeline-section glass-panel">
            <Timeline projectData={projectData} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
