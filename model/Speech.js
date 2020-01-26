const Speaker = require('./Speaker') 
const Comment = require('./Comment') 
const xmlUtil = require('../xmlUtil') 



/**
 * Takes a text and returns a list of comment instances. 
 * (One <kommentar>-tag may include multiple comments)
 * e.g. 
 * (Beifall bei der AfD – Martin Schulz [SPD]: Da kennt ihr euch ja aus!)
 * ->
 * [{fullName:"Martin Schulz", party:"SPD", text:"Da kennt ihr euch ja aus!"}]
 * @param {*} comment the comment to categorize as a string 
 * @returns []
 */
function findComments(text){
    let result = []
    let parts = text.split("–")
    parts.forEach(function(part){
        let newComment = Comment.fromRaw(part)
        if(!newComment.invalid){
            result.push(newComment)
        }
    })
    return result;
}

class Speech {


    constructor(speaker, comments){
       this.speaker = speaker
       this.comments = comments
    }

    static fromXml(xml){
        let speaker = Speaker.fromXml(xmlUtil.findNodes("redner", xml)[0])
        let comments = xmlUtil.findValues("kommentar", xml).flatMap(comment => findComments(comment))        
        return new Speech(speaker, comments)
    }

}

module.exports = Speech
