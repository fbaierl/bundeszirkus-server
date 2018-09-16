var fs = require('fs');
var knowledge = require('./knowledge.js')
var aH = require('./arrayHelper.js')
var DOMParser = new (require('xmldom')).DOMParser;

const Comment = require('./model/comment')
const Speaker = require('./model/speaker')

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
 * Finds basic (non-hierarchical) elements in an XML and returns its value. 
 * @param {*} element the nodes name to search the values for
 * @param {*} xml the xml to search in
 */
function findValues(element, xml) {
    var output = [];
    if(!xml || !xml.childNodes){
        return output;
    }
    var nodes = xml.childNodes;
    if (nodes != null) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeName == element && nodes[i].childNodes.length == 1) {
                output.push(nodes[i].childNodes[0].nodeValue);
            } else {
                output = output.concat(findValues(element, nodes[i]));
            }
        }
    }
    return output;
}

/**
 * Finds all nodes with the tag nodename in an XML.
 * Returns a list of nodes.
 * @param {*} nodeName the node's name to search for 
 * @param {*} xml
 */
function findNodes(nodeName, xml){
    var output = []
    if(!xml || !xml.childNodes){
        return output
    }
    var nodes = xml.childNodes
    if(nodes){
        for (var i = 0; i < nodes.length; i++) {
            if(nodes[i].nodeName == nodeName){
                output.push(nodes[i])
            } else {
                output = output.concat(findNodes(nodeName, nodes[i]));
            }
        }
    }
    return output;
}

/**
 * Transforms a speaker (<redner>) xml tag into json.
 * 
 * example 1:
 *  <redner id="11001938">
 *      <name>
 *          <titel>Dr.</titel>
 *          <vorname>Wolfgang</vorname>
 *          <nachname>Schäuble</nachname>
 *          <fraktion>CDU/CSU</fraktion>
 *      </name>
 *  </redner>
 *  will return: {fullname:"Dr. Wolfgang Schäuble", party:"CDU/CSU", "role:"""}
 * 
 * example 2:
 *  <redner id="11002190">
 *      <name>
 *          <vorname>Alterspräsident Dr. Hermann</vorname>
 *          <nachname>Otto Solms</nachname>
 *          <rolle>
 *              <rolle_lang>Alterspräsident</rolle_lang>
 *              <rolle_kurz>Alterspräsident</rolle_kurz>
 *          </rolle>
 *      </name>
 * </redner>
 * will return: {fullname:"Dr. Hermann Otto Solms", party:"", role:"Alterspräsident"}
 * 
 * @param {*} speechXml the speaker xml
 * @return {fullname:"xxx", party:"xxx", role:"xxx"}
 */
function structureSpeaker(speakerXml){
    // each speaker has a first and a last name
    let firstname = findValues("vorname", speakerXml)[0].trim()
    let lastname = findValues("nachname", speakerXml)[0].trim()
    // each speaker has either information about their fraction OR their role
    let role = ""
    let party = ""
    let roles = findValues("rolle_lang", speakerXml)
    let parties = findValues("fraktion", speakerXml)
    if(roles.length > 0){
        role = roles[0].trim()
        // sometimes the role is included in the firstname, so we remove it here
        firstname = firstname.replace(role, "").trim()
    } else if (parties.length > 0){
        party = parties[0].trim()
    } else {
        console.log("[loader] Couldn't find role or party for speaker: " + firstname + " " +  lastname)
    }
    return new Speaker(firstname + " " + lastname, party, role)
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
        let newComment = new Comment(part)
        if(!newComment.invalid){
            result.push(newComment)
        }
    })
    return result;
}

function loadSpeech(speech) {
    // find meta data about this speech
    // TODO date
    let speakerXml = findNodes("redner", speech)
    // should include one speaker tag per speech
    let speaker = structureSpeaker(speakerXml[0])
    // find comments for each speech and push them to all comments list
    let comments = findValues("kommentar", speech);
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
                    comment: result
                })
            });   
        }
    });
}

/**
 * Loads the data in a single file.
 * @param {string} dirPath 
 * @param {string} fileName 
 */
function loadFile(dirPath, fileName){
    let filePath = dirPath + "/" + fileName
    console.log("[loader] loading file " + fileName)
    var fileContent = fs.readFileSync(filePath, "utf8")
    var document = DOMParser.parseFromString(fileContent, "application  /xml");
    var speeches = findNodes("rede", document)
    speeches.forEach(function(speech) {
        loadSpeech(speech)
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
        console.log("[loader] loading data ...")
        fs.readdir(dirPath, function(err, items) {
            if(err){
                return callback(err);
            }
            for (var i=0; i<items.length; i++) {
                let fileName = items[i]
                loadFile(dirPath, fileName)
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
            return  { speaker:{
                        fullname: elem.speaker.fullname, 
                        partyOrRole: elem.speaker.party + elem.speaker.role, // only one of those is not an empty string 
                    },
                    comment: elem.comment
                    }
        })
        return {data: dataToSend, 
                recordsTotal: allComments.length,
                recordsFiltered: recordsFiltered
            }
    }

    comments(){
        return {data:allComments.map(function(elem){
            // combine party and role to one field here for easier display
            return  { speaker:{
                        fullname: elem.speaker.fullname, 
                        partyOrRole: elem.speaker.party + elem.speaker.role, // only one of those is not an empty string 
                    },
                    comment: elem.comment
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