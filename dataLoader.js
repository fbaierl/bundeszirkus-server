var fs = require('fs');
var knowledge = require('./knowledge.js')
var DOMParser = new (require('xmldom')).DOMParser;

/**
 * 
 */
global.allComments = []

/**
 * Includes two arrays:
 * 1. parties
 * 2. total count of comments
 * 
 * e.g. if the CSU made 3 comments and the Afd made 2 comments:
 * [[CSU, AFD],[3, 2]]
 */
global.totalCommentsPerParty = []


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
    function findOccurences(data){
        var a = [], b = [], prev;
        for ( var i = 0; i < data.length; i++ ) {
            if ( data[i] !== prev ) {
                a.push(data[i]);
                b.push(1);
            } else {
                b[b.length-1]++;
            }
            prev = data[i];
        }

        return [a, b]
    }

    totalCommentsPerParty = findOccurences(allComments.map(x => x.party).sort())
}

exports.comments = function(){
    return {data:allComments}
}

exports.random = function(){
    return allComments[Math.floor(Math.random() * allComments.length)]
}

exports.statsTotalParties = function(){

    let colors = []

    for(party of totalCommentsPerParty[0]){
        let c = knowledge.partyColor(party)
        let rgba = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ', 0.75)'
        colors.push(rgba)
    }

    return {
        datasets: [{
            data: totalCommentsPerParty[1],
            backgroundColor: colors, 
        }],
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: totalCommentsPerParty[0]
    };
}