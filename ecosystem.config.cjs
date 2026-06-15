module.exports = {
  apps: [{
    name: 'dailybloggs',
    script: 'api/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 6789
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 6789
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
