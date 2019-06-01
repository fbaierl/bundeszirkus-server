module.exports = {
  apps: [{
    name: 'bundeszirkus-server',
    script: './index.js',
    env: {
      DISPLAY: ":99"
    }
  },
  {
    "name"        : "Xvfb",
    "interpreter" : "none",
    "script"      : "Xvfb",
    "args"        : ":99"
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
