
const schedule = require('node-schedule') 
const express = require('express')
const app = express()

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
        commentFullname: searchColumns[0].search.value,
        commentParty: searchColumns[1].search.value,
        commentText: searchColumns[2].search.value,
        speakerFullname: searchColumns[3].search.value,
        speakerPartyOrRole: searchColumns[4].search.value,
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
    console.log("Starting the server.")
    app.listen(port, (err) =>  {
        if(err){
            console.log(err)
            serverRunning = false
        }
        serverRunning = true
        console.log('Server running on port ' + port)
    }) 
}

var loadData = function() {
    console.log("Loading data.") 
    dataLoader = new DataLoader()
    let startServerIfNotRunning = () => {
        if(!serverRunning){
            startServer()
        }
    }
    dataLoader.loadData(startServerIfNotRunning)
}

// schedule reloading/scraping of data every 3 hours
schedule.scheduleJob('* */3 * * *', () => {
    // scrape & load data w/o restarting the server
    console.log("Starting scheduled scraping.") 
    dataScraper.scrape(loadData) 
}) 

// scrape, load data & start the server
console.log("Starting initial scraping.")
dataScraper.scrape(loadData)
