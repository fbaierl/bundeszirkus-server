
const schedule = require('node-schedule') 
const express = require('express')
const expressApplication = express()
const logger = require('./logger')

const DataLoader = require('./DataLoader')
const dataScraper = require('./dataScraper')

const port = 3000

var dataLoader = new DataLoader()
var serverRunning = false


let isOfflineMode = process.argv.includes("offline")

expressApplication.use(express.static('public'))

expressApplication.use('/node_modules', express.static(__dirname + '/node_modules/'));

expressApplication.get('/comments', function(req, res){
    res.send(dataLoader.comments())
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

expressApplication.get("/random", function(req, res){
    res.send(dataLoader.random())
})

expressApplication.get("/stats_total_parties", function(req, res){
    res.send(dataLoader.statsTotalParties())
})

expressApplication.get("/stats_total_politicians", function(req, res){
    res.send(dataLoader.statsTotalPoliticians())
})

expressApplication.get("/stats_total_parties_passive", function(req, res){
    res.send(dataLoader.statsTotalPartiesPassive())
})

expressApplication.get("/stats_total_politicians_passive", function(req, res){
    res.send(dataLoader.statsTotalPoliticiansPassive())
})

let startServer = function() { 
    logger.info("Starting the server.")
    expressApplication.listen(port, (err) =>  {
        if(err){
            logger.info(err)
            serverRunning = false
        }
        serverRunning = true
        logger.info('Server running on port ' + port)
    }) 
}

let loadData = function() {
    logger.info("Loading data.") 
    let startServerIfNotRunning = () => {
        if(!serverRunning){
            startServer()
        }
    }
    dataLoader.loadData(startServerIfNotRunning)
}

if(!isOfflineMode){
    schedule.scheduleJob('0 * * * *', () => {
        // scrape & load data w/o restarting the server
        logger.info("Starting scheduled scraping.") 
        dataScraper.scrape(loadData) 
    }) 
    logger.info("Starting server with initial scraping.")
    dataScraper.scrape(loadData)
} else {
    logger.info("Starting server without scraping!")
    loadData()
}


