const logger = require('./logger')
const fs = require('fs')
const async = require('async');
const scraperjs = require('scraperjs')
const url = require('url')

const DATA_DOWNLOAD_DIR = './data/'

class DataDownloader {

	async _downloadFileFromHref(href, callback) {
	    let fileName = url.parse(href).pathname.split('/').pop();
	    logger.info("[downloader] downloading file: " + fileName + " from href: " + href + ".")
	    scraperjs.StaticScraper.create(href)
            .scrape(function($) {
                return $.html()
            })
            .then(function(data) {
                fs.writeFileSync(DATA_DOWNLOAD_DIR + fileName, data)
                logger.info("[downloader] finished writing file " + fileName + ".")
                callback(undefined)
            })
	}

    downloadData(hrefs, callback){
        const _this = this
        // parallel map: https://promise-nuggets.github.io/articles/14-map-in-parallel.html
        async.map(hrefs, function(href, callback) {
            _this._downloadFileFromHref(href, function (err) {
                if (err) return callback(err);
                callback(undefined);
            })
        }, function(err) {
            if(err){
                logger.error(err)
            }
            logger.info("[downloader] finished all downloads.")
            callback()
        });
    }
}

module.exports = DataDownloader