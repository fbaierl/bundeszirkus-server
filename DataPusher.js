const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const logger = require('./logger')
const path = require('path')

class DataPusher {

    async commitAndPushData(dataDirPath, dataPath, fileNames, token) {

        let files = fileNames.map(f => path.join(dataPath, f))
        // stage files
        for(const file of files){
            await git.add({ 
              fs, 
              dir: dataDirPath, 
              filepath: file })
        }
        logger.info("[pusher] staged files: " + fileNames + ".")

        // commit   
        let sha = await git.commit({
            fs,
            dir: dataDirPath,
            author: {
              name: 'Florian Baierl [server-bot]',
              email: 'fbaierl1@gmail.com',
            },
            message: '[data-bot] added new data: ' + fileNames
          })
        logger.info("[pusher] commited: " + sha + ".")

        // push
        let pushResult = await git.push({
            username: token, // github allows to use token as username
            fs,
            http,
            dir: dataDirPath,
            remote: 'origin',
            ref: 'master',
            onAuth: url => {
              return {
                username: token
              }
            }
          })
        logger.info("[pusher] push result: " + pushResult)
    }

}

module.exports = DataPusher