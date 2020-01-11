
const schedule = require('node-schedule') 
const express = require('express')
const app = express()
const logger = require('./logger')

const DataLoader = require('./dataLoader')
var dataScraper = require('./dataScraper.js')

const port = 3000

var dataLoader
var serverRunning = false

app.use(express.static('public'))

app.use('/node_modules', express.static(__dirname + '/node_modules/'));

app.get('/comments', function(req, res){
    res.send(dataLoader.comments())
})

app.get('/comments_server_processing', function(req, res){    
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

app.get("/random", function(req, res){
    res.send(dataLoader.random())
})

app.get("/stats_total_parties", function(req, res){
    res.send(dataLoader.statsTotalParties())
})

app.get("/stats_total_politicians", function(req, res){
    res.send(dataLoader.statsTotalPoliticians())
})

app.get("/stats_total_parties_passive", function(req, res){
    res.send(dataLoader.statsTotalPartiesPassive())
})

app.get("/stats_total_politicians_passive", function(req, res){
    res.send(dataLoader.statsTotalPoliticiansPassive())
})

var startServer = function() { 
    logger.info("Starting the server.")
    app.listen(port, (err) =>  {
        if(err){
            logger.info(err)
            serverRunning = false
        }
        serverRunning = true
        logger.info('Server running on port ' + port)
    }) 
}

var loadData = function() {
    logger.info("Loading data.") 
    dataLoader = new DataLoader()
    let startServerIfNotRunning = () => {
        if(!serverRunning){
            startServer()
        }
    }
    dataLoader.loadData(startServerIfNotRunning)
}

// schedule reloading/scraping of data every hour (at minute 0)
schedule.scheduleJob('0 * * * *', () => {
    // scrape & load data w/o restarting the server
    logger.info("Starting scheduled scraping.") 
    dataScraper.scrape(loadData) 
}) 

logger.info("Starting server!")
// scrape, load data & start the server
logger.info("Starting initial scraping.")
dataScraper.scrape(loadData)
