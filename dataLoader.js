var fs = require('fs');
var knowledge = require('./knowledge.js')
var aH = require('./arrayHelper.js')
var DOMParser = new (require('xmldom')).DOMParser;

/**
 * 
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



function findElements(element, xml) {
    var output = [];

    var nodes = xml.childNodes;

    if (nodes != null) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeName == element && nodes[i].childNodes.length == 1) {
                output.push(nodes[i].childNodes[0].nodeValue);
            } else {
                output = output.concat(findElements(element, nodes[i]));
            }
        }
    }
    return output;
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
            var document = DOMParser.parseFromString(fileContent);
            var comments = findElements("kommentar", document);

            comments.forEach(function(comment) {
                let resultArr = structureComment(comment)
                if(resultArr){
                    resultArr.forEach(function(result){
                        allComments.push(result)
                    });   
                }
            }); 
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
              party: elem.party
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
              fullname: elem.fullname,
              party: elem.party
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