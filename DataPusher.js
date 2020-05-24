const path = require('path')
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const logger = require('./logger')
const async = require('async');

class DataPusher {

    async commitAndPushData(fileNames) {

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
            fs,
            http,
            dir: '.',
            remote: 'origin',
            ref: 'master',
            onAuthFailure: (url, auth) => { 
                logger.info("[pusher] auth failure for url " + url + ".") 
                return { cancel: true }
            },
          })
        logger.info("[pusher] push result: " + pushResult)
    }

}

module.exports = DataPusher