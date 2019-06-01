module.exports = {
  apps: [{
    name: 'bundeszirkus-server',
    script: 'DEBUG=nightmare xvfb-run -a --server-args="-screen 0 1920x1080x24" node index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-18-224-199-156.us-east-2.compute.amazonaws.com',
      key: '~/.ssh/bundeszirkus.pem',
      ref: 'origin/master',
      repo: 'git@github.com:fbaierl/bundeszirkus-server.git',
      path: '/home/ubuntu/bundeszirkus-server',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
