const schedule = require('node-schedule') 
const express = require('express')
const expressApplication = express()
const logger = require('./logger')
const fs = require('fs')
const path = require('path');

const DataLoader = require('./DataLoader')
const DataWriter = require('./DataWriter')
const HrefScraper = require('./HrefScraper')
const DataDownloader = require('./DataDownloader')
const DataPusher = require('./DataPusher')

const port = 3000
const dataRepoDirPath = "./../bundeszirkus-data" // data is in a second repo
const dataPath = "plenary_minutes" // data inside data repo
const relativeDataPath = path.join(dataRepoDirPath, dataPath)
const outFile = "data_out.json"

const dataLoader = new DataLoader()
const hrefScraper = new HrefScraper()
const dataDownloader = new DataDownloader()
const dataPusher = new DataPusher()

let serverRunning = false

const isOfflineMode = process.argv.includes("offline")
const writeOutData = process.argv.includes("writeData")

expressApplication.use(express.static('public'))

expressApplication.use('/blog', express.static('blog/public'))

expressApplication.use('/node_modules', express.static(__dirname + '/node_modules/'));

expressApplication.get('/all_comments', function(req, res){
    res.send(dataLoader.allComments())
})

expressApplication.get('/comments_server_processing', function(req, res){    
    let length = parseInt(req.query.length)
    let start = parseInt(req.query.start)
    let searchColumns = req.query.columns
    let searchParameters = {
        commentText: searchColumns[0].search.value,
        commentFullname: searchColumns[1].search.value,
        commentParty: searchColumns[2].search.value,
        speakerFullname: searchColumns[3].search.value,
        speakerPartyOrRole: searchColumns[4].search.value
    }
    res.send(dataLoader.commentsSlice(start, length, searchParameters))
})

expressApplication.get("/random_comment", function(req, res){
    res.send(dataLoader.randomComment())
})

expressApplication.get("/comments_stats_total_parties", function(req, res){
    res.send(dataLoader.statsTotalParties())
})

expressApplication.get("/comments_stats_total_politicians", function(req, res){
    res.send(dataLoader.statsTotalPoliticians())
})

expressApplication.get("/comments_stats_total_parties_passive", function(req, res){
    res.send(dataLoader.statsTotalPartiesPassive())
})

expressApplication.get("/comments_stats_total_politicians_passive", function(req, res){
    res.send(dataLoader.statsTotalPoliticiansPassive())
})

expressApplication.get("/comments_stats_total_count_per_session_per_party", function(req, res){
    res.send(dataLoader.statsTotalCommentsCountPerSessionPerParty())
})

let startServer = function() { 
    logger.info("Starting the server.")
    expressApplication.listen(port, (err) =>  {
        if(err){
            logger.error(err)
            serverRunning = false
        }
        serverRunning = true
        logger.info('Server running on port ' + port)
    }) 
}

let loadData = function() {
    dataLoader.loadDataSync(relativeDataPath)
    if(writeOutData){
        const writer = new DataWriter()
        writer.writeJSONSync(outFile, dataLoader.plenarySessions())
    }
    if(!serverRunning){
        startServer()
    }
}

async function scrapeAndLoad() {
    const hrefs = await hrefScraper.scrape()
    const downloadedFileNames = await dataDownloader.downloadData(relativeDataPath, hrefs)

    try {
        // read github token
        const authFilePath = path.join(dataRepoDirPath, 'authentication.json')
        let auth = JSON.parse(fs.readFileSync(authFilePath, "utf8"))
        if(downloadedFileNames.length > 0){
            logger.info("Downloaded new data, pushing to repository...")
            await dataPusher.commitAndPushData(dataRepoDirPath, dataPath, downloadedFileNames, auth.token)
        }
    } catch (e) {
        logger.error(e)
    }

    loadData()
}


if(!isOfflineMode){
    schedule.scheduleJob('0 * * * *', () => {
        // scrape & load data w/o restarting the server
        logger.info("Starting scheduled scraping.") 
        scrapeAndLoad()
    }) 
    logger.info("Starting server with initial scraping.")
    scrapeAndLoad()
} else {
    logger.info("Starting server without scraping!")
    loadData()
}

