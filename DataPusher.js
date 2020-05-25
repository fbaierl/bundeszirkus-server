const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const logger = require('./logger')

class DataPusher {

    async commitAndPushData(fileNames, token) {

        // stage files
        for(const file of fileNames){
            await git.add({ fs, dir: '.', filepath: 'data/' + file })
        }
        logger.info("[pusher] staged files: " + fileNames + ".")

        // commit   
        let sha = await git.commit({
            fs,
            dir: '.',
            author: {
              name: 'Florian Baierl [server-bot]',
              email: 'fbaierl1@gmail.com',
            },
            message: '[server-bot] added new data: ' + fileNames
          })
        logger.info("[pusher] commited: " + sha + ".")

        // push
        let pushResult = await git.push({
            username: token, // github allows to use token as username
            fs,
            http,
            dir: '.',
            remote: 'origin',
            ref: 'master',
            onAuth: url => {
              console.log("ON AUTH ###################")
              return {
                username: token
              }
            }
          })
        logger.info("[pusher] push result: " + pushResult)
    }

}

module.exports = DataPusher