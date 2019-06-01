var scraperjs = require('scraperjs');
var $ = require('jquery');
var http = require('http');
var fs = require('fs');
var url = require('url');
const Nightmare = require('nightmare');
const cheerio = require('cheerio');

// https is NOT supported
const BT_LINK = "http://www.bundestag.de"
const DOWNLOAD_DIR = './data/';

var _callback = null
var _foundLinks = 0
var _downloadedLinks = 0

function downloadFileFromHref(href) {
    let fileName = url.parse(href).pathname.split('/').pop();
    console.log("[scraper] downloading file: " + fileName + " from href: " + href)
    scraperjs.StaticScraper.create(href)
	.scrape(function($) {
		return $.html()
	})
	.then(function(data) {
        createFile(fileName, data)
        _downloadedLinks++
        callbackIfFinished()
    })
}

function callbackIfFinished(){
    if(_downloadedLinks >= _foundLinks){
        console.log("[scraper] finished downloading  all " + _downloadedLinks +  " files.")
        _callback()
    }
}

function createFile(fileName, data){
    let file = fs.createWriteStream(DOWNLOAD_DIR + fileName)
    file.write(data)
    file.end()
}

function checkDocumentLink(href) {
    // get href; ex: 
	// (X) /blob/490380/1d83b7e383f9f09d88bd9e89aba07fb0/pp14-data.zip  
	// (O) /blob/562990/056c28051cb695642cb9d72521bba93b/19044-data.xml
	// check with regex:
	// \/blob\/.+?\/.+?\/(\d+)-data.(.*)
    // filename: <1. capturing group>-data.<2nd capturing group>
    var regex = /\/blob\/.+?\/.+?\/(\d+)-data.(.*)/
    var match = regex.exec(href)
    // check if 2nd capturing group is "xml"
    if(match && match[2] && match[2].toLowerCase() === 'xml'){
        // construct download link
	    // result has to look like this: https://www.bundestag.de/blob/563398/99a2c9d4df10fcf44e67d084bf6c8f21/19046-data.xml
        let completeHref = BT_LINK + href
        // construct filename
        let fileName = match[1] + "." + match[2]
        return true
    }
    return false
  }
  


exports.scrape = function(cb) {
    _callback = cb
    _downloadedLinks = 0

    const nightmare = Nightmare({ show: false })
    const url = 'https://www.bundestag.de/services/opendata'

    // we request nightmare to browse to the bundestag.de url and extract the whole inner html
    nightmare
        .goto(url)
        .wait('body')
        .evaluate(() => document.querySelector('body').innerHTML)
        .end()
        .then(response => {
            _downloadedLinks = 0
            let validLinks = extractLinks(response)
            _foundLinks = validLinks.length
            console.log("[scraper] found " + validLinks.length + " valid links.")
            if(validLinks.length > 0){
                validLinks.forEach(href => {
                    downloadFileFromHref(BT_LINK + href)
                });
            } else {
                console.log("[scraper] did not download any files.")
                _callback()
            }  
        }).catch(err => {
            console.log(err);
        });

    // Extracting the links we need
    let extractLinks = html => {
        data = [];
        const $ = cheerio.load(html);
        $('.bt-link-dokument').each(function() {
            data.push(this.attribs.href);
         });
         return data.filter(checkDocumentLink)
    } 

}