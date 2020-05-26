Link to the webpage: [bundeszirkus.de](http://bundeszirkus.de)

![Screenshot](/screencapture-bundeszirkus.png?raw=true "Screenshot Bundeszirkus.de")

## Setup

For the moment the [data repositry](https://github.com/fbaierl/bundeszirkus-data) needs to be cloned inside the same directory as this project.

## Running the server

```
node index.js
```

Xvfb has a number of dependencies. Install the following:

```
apt-get update && apt-get install -y xvfb x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps clang libdbus-1-dev libgtk2.0-dev libnotify-dev libgnome-keyring-dev libgconf2-dev libasound2-dev libcap-dev libcups2-dev libxtst-dev libxss1 libnss3-dev gcc-multilib g++-multilib
```

Test with nightmare:

```
DEBUG=nightmare xvfb-run -a --server-args="-screen 0 1920x1080x24" node index.js
```

Run with nightmare:
```
xvfb-run -a --server-args="-screen 0 1920x1080x24" node index.js
```

Setup on remote (run locally):

```
pm2 deploy ecosystem.config.js production setup
```

Deploy to remote (run locally):

```
npm run-script deploy
```

## Useful commands

### Get the log file from remote

```
sudo scp -i ~/.ssh/bundeszirkus.pem ubuntu@ec2-xx-xxx-xxx-xxx.us-east-2.compute.amazonaws.com:/home/ubuntu/bundeszirkus-server/current/bundeszirkus.log ~/remote-log.log
```

## MIT License

Copyright 2018 Florian Baierl

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWA