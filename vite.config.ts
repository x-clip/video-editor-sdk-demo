import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    mkcert({
      source: 'coding',
      savePath: './ssh',
    }),
    react({
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
        ],
      },
    }),
  ],
  css: {
    modules: {
      generateScopedName: '[name]__[local]__[hash:5]',
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  base: '/', // 公共基础路径
  server: {
    https: true,
    host: '0.0.0.0',
    port: 3001,
    proxy: {
      '/cgi-bin': {
        target: 'https://video.h5ds.com',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://video.h5ds.com',
        changeOrigin: true,
      },
    },
  },
});
