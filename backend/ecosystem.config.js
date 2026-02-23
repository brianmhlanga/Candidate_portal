/**
 * PM2 ecosystem config for Candidate Portal backend.
 * Run from backend folder: pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: 'candidate-backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
