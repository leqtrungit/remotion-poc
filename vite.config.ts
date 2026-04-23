import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /**
   * Nếu trình duyệt chặn CORS tới Ollama, trong dev đặt:
   * VITE_OLLAMA_API_URL=http://localhost:5173/ollama-proxy/api/generate
   */
  server: {
    proxy: {
      '/ollama-proxy': {
        target: 'https://ollama.wavesgroup.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama-proxy/, ''),
      },
    },
  },
})
