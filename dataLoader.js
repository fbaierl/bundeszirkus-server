var fs = require('fs');
var knowledge = require('./knowledge.js')
var aH = require('./arrayHelper.js')
var DOMParser = new (require('xmldom')).DOMParser;
const logger = require('./logger')
const xmlUtil = require('./xmlUtil')

const Comment = require('./model/Comment')
const Speaker = require('./model/Speaker')


/**
 * Contains all comments.
 * 
 * Format:
 * [{
 *   "speaker":{
 *      "fullname": "Dr. Wolfgang Schäuble", 
 *      "party":"CDU/CSU", 
 *      "role": "" // speaker can have either role or party
 *   },
 *   "comment":{
 *      "fullname":"Martin Schulz", 
 *      "party":"SPD", 
 *      "text":"Da kennt ihr euch ja aus!"
 *   }
 * }]
 */
allComments = []

/**
 * Data depicting how much comments a party made in total.
 * 
 * Format:
 * [{
 *  "party": "SPD",
 *  "occurences":100
 * }]
 */
totalCommentsPerParty = []

/**
 * Data depicting how much comments a politician made in total.
 *
 * Format:
 *  [{
 *   "fullname": "Martin Schulz", 
 *   "party": "SPD", 
 *   "occurences": "100"
 *  }]
 */
totalCommentsPerPolitician = []

/**
 * Data depicting how much comments were made during a particular parties speech.
 * 
 * Format:
 * [{
 *  "party": "SPD",
 *  "occurences": "100"
 * }]
 */
totalCommentsPerPartyPassive = []



/**
 * Transforms a header data (<kopfdaten>) xml tag into json.
 * 
 * example: 
 * 
 * <kopfdaten>
 *   <plenarprotokoll-nummer>Plenarprotokoll <wahlperiode>19</wahlperiode>/<sitzungsnr>14</sitzungsnr></plenarprotokoll-nummer>
 *   <herausgeber>Deutscher Bundestag</herausgeber>
 *   <berichtart>Stenografischer Bericht</berichtart>
 *   <sitzungstitel><sitzungsnr>14</sitzungsnr>. Sitzung</sitzungstitel>
 *   <veranstaltungsdaten><ort>Berlin</ort>, <datum date="22.02.2018">Donnerstag, den 22. Februar 2018</datum></veranstaltungsdaten>
 * </kopfdaten>
 * 
 * will return: { date: 22.02.2018, electionPeriod: 19, sessionNumber: 14 }
 * 
 * @param {*} headerDataXml the header data xml
 * @return { date: xxx, electionPeriod: xxx, sessionNumber: xxx }
 */
function structureHeaderDataXml(headerDataXml){
    let datumNode = xmlUtil.findNodes("datum", headerDataXml)[0]
    var date = undefined
    if(datumNode) {
        date = datumNode.getAttribute("date") 
    }
    let sessionNumber = xmlUtil.findValues("sitzungsnr", headerDataXml)[0]
    let electionPeriod = xmlUtil.findValues("wahlperiode", headerDataXml)[0]
    let result = { date: date, sessionNumber: sessionNumber, electionPeriod: electionPeriod }
    return result
}


/**
 * Returns a list of structured comment objects. 
 * (One <kommentar>-tag may include multiple comments)
 * e.g. 
 * (Beifall bei der AfD – Martin Schulz [SPD]: Da kennt ihr euch ja aus!)
 * ->
 * [{fullName:"Martin Schulz", party:"SPD", text:"Da kennt ihr euch ja aus!"}]
 * @param {*} comment the comment to categorize as a string 
 * @returns []
 */
function structureComment(text){
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

function loadSpeech(speech, headerData) {
    let speakerXml = xmlUtil.findNodes("redner", speech)
    // should include one speaker tag per speech
    let speaker = Speaker.fromXml(speakerXml[0])
    if(speaker){
        // find comments for each speech and push them to all comments list
        let comments = xmlUtil.findValues("kommentar", speech);
        comments.forEach(function(comment) {
            let resultArr = structureComment(comment)
            if(resultArr){
                resultArr.forEach(function(result){
                    allComments.push({
                        speaker: {
                            fullname: speaker.fullname,
                            party: speaker.party,
                            role: speaker.role
                        },
                        date: headerData.date,
                        sessionNumber: headerData.sessionNumber,
                        electionPeriod: headerData.electionPeriod,
                        comment: result
                    })
                });   
            }
        });
    }
}

/**
 * Loads the data in a single file.
 * @param {string} dirPath 
 * @param {string} fileName 
 */
function loadFile(dirPath, fileName){
    let filePath = dirPath + "/" + fileName
    var fileContent = fs.readFileSync(filePath, "utf8")
    var document = DOMParser.parseFromString(fileContent, "application  /xml");
    let headerData = structureHeaderDataXml(document)
    xmlUtil.findNodes("rede", document).forEach(function(speech) {
        loadSpeech(speech, headerData)
    })
}

/**
 * @param {*} allComments 
 * @returns {Object[]} comments per political party stats
 */
function findCommentsPerParty(allComments){
    return aH.findOccurencesOfParties(
        allComments.map(function(elem) {
            return {
              party: elem.comment.party
            }
        })
    ).sort(function (a, b) {
        return b.occurences - a.occurences;
    });
}

function findCommentsPerPartyPassive(allComments){
    return aH.findOccurencesOfParties(
        allComments
        // filter out speakers with a role instead of party affiliation
        .filter(comment => comment.speaker.party != null && 
                           comment.speaker.party != undefined && 
                           comment.speaker.party != "")
        // use speaker
        .map(function(elem) {
            return { 
                fullname: elem.speaker.fullname,
                party: elem.speaker.party
            }
    }))
    .sort(function (a, b) {
        return b.occurences - a.occurences;
    })
}

/**
 * 
 * @param {*} allComments 
 * @returns {Object[]} comments per politician
 */
function findCommentsPerPolitician(allComments){
    return aH.findOccurencesOfPoliticians(
        allComments.map(function(elem) {
            return {
              fullname: elem.comment.fullname,
              party: elem.comment.party
            }
        })
    )
    .sort(function (a, b) {
        return b.occurences - a.occurences;
    })
} 

function findCommentsPerPoliticianPassive(allComments){
    return aH.findOccurencesOfPoliticians(
        allComments
        // use speaker
        .map(function(elem) {
            return { 
                fullname: elem.speaker.fullname,
                party: elem.speaker.party + elem.speaker.role  // only one of those is not an empty string 
            }
        })
    )
    .sort(function (a, b) {
        return b.occurences - a.occurences;
    })
}

function calculateStatisticalData(allComments) {
    totalCommentsPerParty = findCommentsPerParty(allComments)
    totalCommentsPerPolitician = findCommentsPerPolitician(allComments).slice(0,20)
    totalCommentsPerPartyPassive = findCommentsPerPartyPassive(allComments)
    totalCommentsPerPoliticianPassive = findCommentsPerPoliticianPassive(allComments).slice(0,20)
}

function applySearchParams(comments, searchParams){
    let result = comments
    if(searchParams.speakerFullname && searchParams.speakerFullname != ""){
        result = result.filter(f => f.speaker.fullname.toLowerCase().includes(searchParams.speakerFullname.toLowerCase()))
    }
    if(searchParams.speakerPartyOrRole && searchParams.speakerPartyOrRole != ""){
        result = result.filter(f => (f.speaker.party && f.speaker.party.toLowerCase().includes(searchParams.speakerPartyOrRole.toLowerCase()) ||
                                    (f.speaker.role && f.speaker.role.toLowerCase().includes(searchParams.speakerPartyOrRole.toLowerCase()))))
    }
    if(searchParams.commentFullname && searchParams.commentFullname != ""){
        result = result.filter(f => f.comment.fullname.toLowerCase().includes(searchParams.commentFullname.toLowerCase()))
    }
    if(searchParams.commentParty && searchParams.commentParty != ""){
        result = result.filter(f => f.comment.party.toLowerCase().includes(searchParams.commentParty.toLowerCase()))
    }
    if(searchParams.commentText && searchParams.commentText != ""){
        result = result.filter(f => f.comment.text.toLowerCase().includes(searchParams.commentText.toLowerCase()))
    }
    return result
}

function reset(){
    allComments = []
    totalCommentsPerParty = []
    totalCommentsPerPolitician = []
    totalCommentsPerPartyPassive = []
}

class DataLoader{
    /**
     * This method should be called before the server starts listening to requests 
     * in order to load all data neccessary.
     * @param {function} callback 
     */
    loadData(callback){
        reset()
        var dirPath = "data"
        var files = ""
        logger.info("[loader] loading data ...")
        fs.readdir(dirPath, function(err, items) {
            if(err){
                return callback(err);
            }
            logger.info("[loader] loading files:" + items)
            for (var i=0; i<items.length; i++) {
                loadFile(dirPath, items[i])
            }
            calculateStatisticalData(allComments)
            if(callback){
                callback()
            }
        });
    }

    commentsSlice(start, length, searchParameters){
        let dataToSend = applySearchParams(allComments, searchParameters)
        let recordsFiltered = dataToSend.length
        dataToSend = dataToSend.slice(start, start + length).map(function(elem){
            // combine party and role to one field here for easier display
            const { speaker, comment } = elem;
            return  { speaker:{
                        fullname: speaker.fullname, 
                        partyOrRole: speaker.party + speaker.role, // only one of those is not an empty string 
                    },
                    comment: comment
                    }
        })
        return {data: dataToSend, 
                recordsTotal: allComments.length,
                recordsFiltered: recordsFiltered
            }
    }

    comments(){
        return {data:allComments.map(function(elem){
            const { speaker, comment } = elem;
            // combine party and role to one field here for easier display
            return  { speaker: {
                        fullname: speaker.fullname, 
                        partyOrRole: speaker.party + speaker.role, // only one of those is not an empty string 
                    },
                    comment: comment
                    }
        })}
    }

    random(){
        return allComments[Math.floor(Math.random() * allComments.length)]
    }

    statsTotalParties(){
        return totalCommentsPerParty.map(function(e, i) {
            let c = knowledge.partyColor(e.party)
            return {
                party: e.party,
                occurences: e.occurences,
                color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
            }
        }); 
    }

    statsTotalPoliticians(){
        return totalCommentsPerPolitician.map(function(e, i) {
            let c = knowledge.partyColor(e.party)
            return {
                fullname: e.fullname,
                party: e.party,
                occurences: e.occurences,
                color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
            }
        }); 
    }

    statsTotalPartiesPassive(){
        return totalCommentsPerPartyPassive.map(function(e, i) {
            let c = knowledge.partyColor(e.party)
            return {
                party: e.party,
                occurences: e.occurences,
                color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
            }
        });
    }

    statsTotalPoliticiansPassive(){
        return totalCommentsPerPoliticianPassive.map(function(e, i) {
            let c = knowledge.partyColor(e.party)
            return {
                fullname: e.fullname,
                party: e.party,
                occurences: e.occurences,
                color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
            }
        }); 
    }

}

module.exports = DataLoader