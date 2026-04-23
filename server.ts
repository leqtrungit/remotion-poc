import express from 'express';
import cors from 'cors';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support large JSON files

const port = process.env.PORT || 3000;

// Path to the Remotion Root file
const compositionEntryPoint = path.resolve('./src/remotion/Root.tsx');
let bundledDir: string | null = null;

app.post('/render', async (req, res) => {
  try {
    const inputProps = req.body;
    
    // Validate basics
    if (!inputProps || !inputProps.fps || !inputProps.durationInFrames) {
      return res.status(400).json({ error: 'Invalid RemotionProjectJson payload' });
    }

    console.log('Starting render process for duration:', inputProps.durationInFrames);

    // Only bundle once and cache the webpack build
    console.log('Bundling project...');
    bundledDir = await bundle({
      entryPoint: compositionEntryPoint,
      webpackOverride: (config) => config,
    });
    console.log('Bundled successfully at', bundledDir);

    const composition = await selectComposition({
      serveUrl: bundledDir,
      id: 'MainComposition',
      inputProps,
    });

    // Ensure out directory exists
    const outDir = path.resolve('./out');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outputLocation = path.join(outDir, `render-${Date.now()}.mp4`);

    console.log('Rendering media to', outputLocation);
    await renderMedia({
      composition,
      serveUrl: bundledDir,
      outputLocation,
      inputProps,
      codec: 'h264',
      chromiumOptions: {
        enableMultiProcessOnLinux: true,
        // Optional: reduce CPU usage slightly, important for Docker
        gl: 'angle',
      },
      onProgress: ({ progress }) => {
        console.log(`Rendering is ${Math.round(progress * 100)}% complete`);
      },
    });

    console.log('Render complete!');
    res.json({
      success: true,
      message: 'Rendered successfully!',
      downloadUrl: `/download/${path.basename(outputLocation)}`
    });

  } catch (err: any) {
    console.error('Render error:', err);
    res.status(500).json({ error: err.message || 'Render failed' });
  }
});

// Expose the out folder to download
app.use('/download', express.static(path.resolve('./out')));

app.listen(port, () => {
  console.log(`Remotion Render Server running on http://localhost:${port}`);
  console.log(`Send POST to http://localhost:${port}/render with JSON body`);
});
