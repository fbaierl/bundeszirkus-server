const express = require('express')
const app = express()

var dataLoader = require('./dataLoader.js')

app.use(express.static('public'))

app.get('/comments', function(req, res){

    dataLoader.comments(function(err, body){
        res.send(body)
    }); 
})

app.listen(3000, () => console.log('Server running on port 3000'))

  