import React, { useState, useEffect } from 'react';
import type { RemotionProjectJson } from '../../types';
import './JsonEditor.css';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface JsonEditorProps {
  value: RemotionProjectJson;
  onChange: (value: RemotionProjectJson) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange }) => {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync prop to state initially and when it changes (if not in focus)
  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
    setError(null);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    
    try {
      const parsed = JSON.parse(newValue);
      // Basic validation: must be an object with fps, durationInFrames, etc.
      if (typeof parsed !== 'object' || !parsed.fps || !parsed.tracks) {
        throw new Error('Invalid JSON structure: missing required fields (fps, tracks).');
      }
      setError(null);
      // Note: Debouncing might be better here for performance, but this is a PoC
      onChange(parsed);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
    }
  };

  return (
    <div className="json-editor-container">
      <div className="json-editor-header">
        <h2>JSON Data <span className="subtitle">Prepared for Remotion</span></h2>
        <div className="status-indicator">
          {error ? (
            <span className="status error"><AlertCircle size={16} /> JSON Error</span>
          ) : (
            <span className="status success"><CheckCircle2 size={16} /> Valid</span>
          )}
        </div>
      </div>
      <div className="json-editor-body">
        <textarea 
          className={`json-textarea ${error ? 'has-error' : ''}`}
          value={text}
          onChange={handleChange}
          spellCheck={false}
          placeholder="Enter JSON here..."
        />
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default JsonEditor;
