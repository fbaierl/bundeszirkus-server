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

var startListening = function() {
    app.listen(3000, () => console.log('Server running on port 3000'))
}

dataLoader.loadData(startListening)


  