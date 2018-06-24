var fs = require('fs');
var knowledge = require('./knowledge.js')
var aH = require('./arrayHelper.js')
var DOMParser = new (require('xmldom')).DOMParser;

/**
 * Format:
 * [{
 *   "speaker_fullname":"Dr. Wolfgang Schäuble", 
 *   "speaker_party":"CDU/CSU", 
 *   "speaker_role:"",
 *   "fullName":"Martin Schulz", 
 *   "party":"SPD", 
 *   "text":"Da kennt ihr euch ja aus!"
 * }]
 */
allComments = []

/**
 * 
 */
totalCommentsPerParty = []

/**
 * 
 */
totalCommentsPerPolitician = []


/**
 * Finds basic (non-hierarchical) elements in an XML and returns its value. 
 * @param {*} element the nodes name to search the values for
 * @param {*} xml the xml to search
 */
function findValues(element, xml) {
    var output = [];

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
    let role = null
    let party = null
    
    let roles = findValues("rolle_lang", speakerXml)
    let parties = findValues("fraktion", speakerXml)

    if(roles.length > 0){
        role = roles[0].trim()
    } else if (parties.length > 0){
        party = parties[0].trim()
    } else {
        console.log("Couldn't find role or fraction for speaker: " + firstname + " " +  lastname)
    }

    // sometimes the role is included in the firstname, so we remove it here
    if(role){
        firstname = firstname.replace(role, "").trim()
    }

    return {fullname:firstname + " " + lastname, party:party, role:role}
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
function structureComment(comment){
    let result = []
    let parts = comment.split("–")

    parts.forEach(function(part){
        /*
        * Regex will result in capturing groups, e.g. for "(Beifall bei der AfD – Martin Schulz [SPD]: Da kennt ihr euch ja aus!)"
        * 1. "Martin Schulz"
        * 2. "SPD"
        * 3. "Da kennt ihr euch ja aus!"
        * 
        * Some comments also include "an ... gewandt", e.g.
        * "Dr. Volker Ullrich [CDU/CSU], an DIE LINKE gewandt: Wo ist denn Frau Wagenknecht heute?)"
        * 
        * Some comments also include the city a representative is from, e.g. 
        * "Carsten Schneider [Erfurt] [SPD]: Wir sind es schon!"
        * 
        * Good resource for testing regex: regex101.com
        */
        let r = /(?:\(|^)?(.*?) (?:\[.+\] )?\[(.*?)\](?::|, an .+? gewandt:) (.*?)(?:\)|$)/g
        let match = r.exec(part);

        if(match){

            let fullname = match[1].trim()
            let party = match[2].trim()
            let text = match[3].trim()
    
            // ... in case fullname is e.g. "Gegenruf des Abg. Karsten Hilse"
            fullname = fullname.replace(/Gegenrufe? de(s|r) Abg[.]?/, "").trim()
                
            // ... in case fullname has a predeceding "Abg" or "Abg."
            fullname = fullname.replace(/Abg.?/,"").trim()
    
            result.push({fullname:fullname, party:party, text:text})
        }
    })

    return result;
}

exports.loadData = function(callback){
    var dirPath = "data"
    var files = ""

    console.log("Now loading data ...")
    fs.readdir(dirPath, function(err, items) {
        if(err){
            return callback(err);
        }

        for (var i=0; i<items.length; i++) {
            let fileName = items[i]
            let filePath = dirPath + "/" + fileName

            console.log("Loading file " + fileName)

            var fileContent = fs.readFileSync(filePath, "utf8")
            var document = DOMParser.parseFromString(fileContent, "application  /xml");

            var speeches = findNodes("rede", document)

            speeches.forEach(function(speech) {
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
                                    fullname:speaker.fullname,
                                    roleOrFraction: (speaker.party) ? speaker.party : speaker.role
                                },
                                comment: result
                            })
                        });   
                    }
                });
            })
        }
        
        calculateStatisticalData(allComments)

        callback()
    });
}


function calculateStatisticalData(allComments) {
    /*
     * Comments per political party
     */
    totalCommentsPerParty = aH.findOccurencesOfPartiesCommenting(
        allComments.map(function(elem) {
            return {
              party: elem.comment.party
            }
        })
    )
    totalCommentsPerParty.sort(function (a, b) {
        return b.occurences - a.occurences;
    });

    /*
     * Comments per politician
     */
    totalCommentsPerPolitician = aH.findOccurencesOfPoliticiansCommenting(
        allComments.map(function(elem) {
            return {
              fullname: elem.comment.fullname,
              party: elem.comment.party
            }
        })
    );
    totalCommentsPerPolitician.sort(function (a, b) {
        return b.occurences - a.occurences;
    });
    // Top 20
    totalCommentsPerPolitician = totalCommentsPerPolitician.slice(0,20)

}

exports.comments = function(){
    return {data:allComments}
}

exports.random = function(){
    return allComments[Math.floor(Math.random() * allComments.length)]
}

exports.statsTotalParties = function(){
    return totalCommentsPerParty.map(function(e, i) {
        let c = knowledge.partyColor(e.party)
        return {
            party: e.party,
            occurences: e.occurences,
            color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
        }
      }); 
}

exports.statsTotalPoliticians = function(){
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