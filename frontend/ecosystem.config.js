/**
 * PM2 ecosystem config for Candidate Portal frontend (Vite preview server).
 * Build first: npm run build
 * Run from frontend folder: pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: 'candidate-frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: ['preview', '--port', '4173'],
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
