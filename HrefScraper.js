const Nightmare = require('nightmare')
const Xvfb = require('xvfb')
const logger = require('./logger')
const os = require('os')

const BT_LINK = "http://www.bundestag.de" // https is NOT supported
const BT_LINK_OPENDATA = 'https://www.bundestag.de/services/opendata'

const runsOnWindows = (os.platform() === 'win32')
const useXvfb = !runsOnWindows && !process.argv.includes("noXvfb")

class DataScraper {

	_checkDocumentLink(href) {
	    // get href; ex: 
		// (X) /blob/490380/1d83b7e383f9f09d88bd9e89aba07fb0/pp14-data.zip  
		// (O) /blob/562990/056c28051cb695642cb9d72521bba93b/19044-data.xml
		// check with regex:
		// \/blob\/.+?\/.+?\/(\d+)-data.(.*)
		// filename: <1. capturing group>-data.<2nd capturing group>
	    const regex = /\/blob\/.+?\/.+?\/(\d+)-data.(.*)/
	    const match = regex.exec(href)
	    // check if 2nd capturing group is "xml"
	    if(match && match[2] && match[2].toLowerCase() === 'xml'){
	        // construct download link
			// result has to look like this: https://www.bundestag.de/blob/563398/99a2c9d4df10fcf44e67d084bf6c8f21/19046-data.xml
	        return href
	    }
	    return undefined
	}

	scrape(callback) {
		let checkDocumentLink = this._checkDocumentLink
		
		if(useXvfb){
			logger.info("Using Xvfb for scraping.")
			let xvfb = new Xvfb()
			try {
				xvfb.startSync()
			} catch (e) {
				logger.error(e)
			}
		}
		
		let nightmare = new Nightmare({ show: false })
	    // we request nightmare to browse to the bundestag.de url and extract the whole inner html
	    nightmare
	        .goto(BT_LINK_OPENDATA)
	        .wait(3000)
			.evaluate(() => Array.from(document.querySelectorAll('.bt-link-dokument')).map(a => a.href)) // return of document.querySelectorAll is not serializable.
			.end()
			.then(foundHrefs => {
				let hrefs = [];
				foundHrefs.forEach(href => {
					let candidate = checkDocumentLink(href)
					if(candidate){
						hrefs.push(candidate)
					}
				})
				logger.info("[scraper] found " + hrefs.length + " valid links out of " + foundHrefs.length + "links in total.")
				if(useXvfb){
					xvfb.stopSync();
				}
				callback(undefined, hrefs)
				return
			})
			.catch(err => {
				if(useXvfb){
					xvfb.stopSync();  
				}
				logger.error("[scraper] did not download any files.")
				logger.error(err)
				callback(err, undefined)
				return
			})
	}
}

module.exports = DataScraper