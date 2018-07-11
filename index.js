const express = require('express')
const app = express()

var dataLoader = require('./dataLoader.js')

app.use(express.static('public'))

app.get('/comments', function(req, res){
    res.send(dataLoader.comments())
})

app.get('/comments_server_processing', function(req, res){    
    let length = parseInt(req.query.length)
    let start = parseInt(req.query.start)
    let searchColumns = req.query.columns
    let searchParameters = {
        speakerFullname: searchColumns[0].search.value,
        speakerPartyOrRole: searchColumns[1].search.value,
        commentFullname: searchColumns[2].search.value,
        commentParty: searchColumns[3].search.value,
        commentText: searchColumns[4].search.value
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

var startListening = function() {
    app.listen(3000, () => console.log('Server running on port 3000'))
}

dataLoader.loadData(startListening)


  