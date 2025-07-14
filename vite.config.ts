import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/demo': {
        target: 'http://localhost:5001/student-firebase-demo-0712/us-central1/api',
        changeOrigin: true,
      },
    },
  },
});
