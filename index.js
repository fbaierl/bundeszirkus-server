const express = require('express')
const app = express()

var dataLoader = require('./dataLoader.js')

app.use(express.static('public'))

app.get('/comments', function(req, res){
    res.send(dataLoader.comments())
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

var startListening = function() {
    app.listen(3000, () => console.log('Server running on port 3000'))
}

dataLoader.loadData(startListening)


  