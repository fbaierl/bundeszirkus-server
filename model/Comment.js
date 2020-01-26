var util = require('../util.js')
var modelUtil = require('./modelUtil.js')


class Comment {

        constructor(fullname, party, text) {
                this.fullname = fullname
                this.party = party
                this.text = text
        }

        /**
         Constructs a Comment object using a text passage from the protocols
        */
        static fromRaw(raw) {
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
        * 
        * Also comments might look something like this: "Dr.&#xA0;h. c. [Univ Kyiv] Hans Michelbach [CDU/CSU]: Quatsch! Unsinn!"
        */
       let r = /(?:\(|^)?(.*) (?:\[.+\] )?\[(.*?)\](?::|, an .+? gewandt:) (.*?)(?:\)|$)/g
       let match = r.exec(raw);
       if(match){
            let fullname = util.cleanWhiteSpaces(modelUtil.cleanUpFullName(match[1].trim()))
            let party = util.cleanWhiteSpaces(modelUtil.cleanUpParty(match[2].trim()))
            let text = util.cleanWhiteSpaces(match[3].trim())
            return new Comment(fullname, party, text)
       } else {
           return {invalid:true}
       }
        }
       
}


module.exports = Comment