const path = require('path')
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const logger = require('./logger')
const async = require('async');

class DataPusher {




    async commitAndPushData(fileNames) {

        for(const file of fileNames){
            await git.add({ fs, dir: '.', filepath: 'data/' + file })
        }

        logger.info("[pusher] staged files: " + fileNames + ".")



        // get the status of all the files in 'src'
        /*
        let status2 = await git.statusMatrix({
            fs,
            dir: 'data'
        })
        logger.info(status2)
        */

    }

}

module.exports = DataPusher