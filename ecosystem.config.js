module.exports = {
  apps: [{
    name: 'bundeszirkus-server',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-18-188-186-31.us-east-2.compute.amazonaws.com',
      key: '~/.ssh/bundeszirkus.pem',
      ref: 'origin/master',
      repo: 'git@github.com/fbaierl/bundeszirkus-server.git',
      path: '/home/ubuntu/bundeszirkus-server',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
