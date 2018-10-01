var util = require('./../util.js')

function Comment(fullname, party, text) {
        this.fullname = fullname
        this.party = party
        this.text = text
}

/**
 * Constructs a Comment object using a text passage from the protocols
 */
function Comment(raw){
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
        * 
        * Sometimes the document uses different kinds of whitespaces, so we have to filter them out too...
        */
       let r = /(?:\(|^)?(.*?) (?:\[.+\] )?\[(.*?)\](?::|, an .+? gewandt:) (.*?)(?:\)|$)/g
       let match = r.exec(raw);
       if(match){
            let fullname = match[1].trim()
                        // ... in case fullname is e.g. "Gegenruf des Abg. Karsten Hilse"
                        .replace(/Gegenrufe? de(s|r) Abg[.]?/, "")
                        // ... in case fullname has a predeceding "Abg" or "Abg."
                        .replace(/Abg.?/,"")
            let party = match[2].trim()
            // work-around for a faulty raw xml file (19046-data.xml)
            if(party === "BÜNDNIS 90/D"){
                party = "BÜNDNIS 90/DIE GRÜNEN"
             }
            let text = match[3].trim()
            this.fullname = util.cleanWhiteSpaces(fullname).trim()
            this.party = util.cleanWhiteSpaces(party)
            this.text = util.cleanWhiteSpaces(text)
       } else {
           return {invalid:true}
       }

}

module.exports = Comment