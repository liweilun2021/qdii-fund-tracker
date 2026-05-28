module.exports = {
  apps: [
    {
      name: 'fund-server',
      cwd: './server',
      script: '../node_modules/.bin/tsx',
      args: 'src/index.ts',
      watch: ['src'],
      watch_delay: 1000,
      ignore_watch: ['node_modules'],
    },
    {
      name: 'fund-client',
      cwd: './client',
      script: '../node_modules/.bin/vite',
      watch: false,
    },
  ],
};
