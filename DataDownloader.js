const logger = require('./logger')
const fs = require('fs')
const scraperjs = require('scraperjs')
const url = require('url')
const path = require('path');

class DataDownloader {


    urlToFileName(href) {
        return url.parse(href).pathname.split('/').pop()
    }

	async _downloadFileFromHref(dataDirPath, href) {
        let fileName = this.urlToFileName(href)
        logger.info("[downloader] downloading file: " + fileName + " from href: " + href + ".")
	    await scraperjs.StaticScraper.create(href)
            .scrape(function($) {
                return $.html()
            })
            .then(function(data) {
                fs.writeFileSync(path.join(dataDirPath, fileName), data)
                logger.info("[downloader] finished writing file " + fileName + ".")
            })
        return fileName
    }
    

    async filesInData(){
        return 
    }


    /**
     * Downloads files from the given hrefs and saves it in data, if not already present.
     * @param {*} hrefs hrefs to download
     * @returns file names of downloaded files
     */
    async downloadData(dataDirPath, hrefs){
        // don't download the data already present
        let filesPresent = fs.readdirSync(dataDirPath)
        let filteredHrefs = hrefs.filter(value => {
            let name = this.urlToFileName(value)
            if(filesPresent.includes(name)){
                logger.info("Not downloading " + name + ": already present on disc.")
                return false
            } else {
                return true
            }
        })
        let downloadedFileNames = []
        if(filteredHrefs.length <= 0) {
            logger.info("[downloader] nothing to download.")
        } else {
            logger.info("[downloader] starting downloads...")
            for(const href of filteredHrefs){
                downloadedFileNames.push(await this._downloadFileFromHref(dataDirPath, href))
            }
            logger.info("[downloader] finished all downloads.")
            
        }
        return downloadedFileNames
    }
}

module.exports = DataDownloader