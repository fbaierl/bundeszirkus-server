const aH = require('./arrayHelper')
const util = require('util')


class DataBase {


    /**
     * Contains all comments.
     * 
     * Format:
     * [
     *   "Comment":{
     *      "fullname":"Martin Schulz", 
     *      "party":"SPD", 
     *      "text":"Da kennt ihr euch ja aus!"
     *   }
     * }]
     */
    allComments = []

    /**
     * Contains all comments with speakers.
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
    allCommentsWithSpeaker = []

    /**allComments
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
     * TODO
     */
    totalCommentsCountPerSessionPerParty = []
    
    constructor(plenarySessions){
        this.update(plenarySessions)
    }

    reset(){
        this.update([])
    }

    update(plenarySessions){
        this.plenarySessions = plenarySessions
        this._calculateStatisticalData()
    }

    /**
     * Calculates all the data needed. 
     * This is kept in memory to only calculate it once when the server starts/updates.
     */
    _calculateStatisticalData() {
        this.allComments = this.plenarySessions.flatMap(ps => ps.speeches).flatMap(s => s.comments)
        this.allCommentsWithSpeaker = this._findCommentsWithSpeaker()
        this.totalCommentsPerParty = this._findCommentsPerParty()
        this.totalCommentsPerPolitician = this._findCommentsPerPolitician().slice(0,20)
        this.totalCommentsPerPartyPassive = this._findCommentsPerPartyPassive()
        this.totalCommentsPerPoliticianPassive = this._findCommentsPerPoliticianPassive().slice(0,20)
        this.totalCommentsPerSessionPerParty = this._findTotalCommentsCountPerSessionPerParty()
    }

    _findCommentsWithSpeaker() {
        return this.plenarySessions
            .flatMap(ps => ps.speeches)
            .flatMap(speech => speech.comments
                .map( function(comment) {
                    return { comment: comment, speaker: speech.speaker }
                }))
    }

    /**
     * @returns {Object[]} comments per political party stats
     */
    _findCommentsPerParty(){ 
        let parties = this.plenarySessions
            .flatMap(session => session.speeches)
            .flatMap(speech => speech.comments)
            .map( function(comment) {
                return { party: comment.party}
            })
        let result = aH.findOccurencesOfParties(parties).sort(function (a, b) {
            return b.occurences - a.occurences
        })   
        return result
    }

    _findCommentsPerPartyPassive(){
        let parties = this.plenarySessions
            .flatMap(ps => ps.speeches)
            .filter(speech => speech.speaker.party != null && 
                    speech.speaker.party != undefined && 
                    speech.speaker.party != "")
            .flatMap(speech => speech.comments
                .map( function(comment) {
                    return { party: speech.speaker.party}
                }))
        return aH.findOccurencesOfParties(parties).sort(function (a, b) {
            return b.occurences - a.occurences
        })
    }

    /**
     * 
     * @param {*} allComments 
     * @returns {Object[]} comments per politician
     */
    _findCommentsPerPolitician(){
        return aH.findOccurencesOfPoliticians(
            this.allComments.map(function(comment) {
                return {
                    fullname: comment.fullname,
                    party: comment.party
                }
            })
        )
        .sort(function (a, b) {
            return b.occurences - a.occurences;
        })
    } 

    _findCommentsPerPoliticianPassive(){ 
        let politicians  = this.plenarySessions
            .flatMap(ps => ps.speeches)
            .filter(speech => speech.speaker.party != null && 
                    speech.speaker.party != undefined && 
                    speech.speaker.party != "")
            .flatMap(speech => speech.comments
                .map( function(comment) {
                    return { 
                        party: speech.speaker.party, 
                        fullname: speech.speaker.fullname
                    }
                })) 
        return aH.findOccurencesOfPoliticians(politicians).sort(function (a, b) {
            return b.occurences - a.occurences
        })
    }

    _findTotalCommentsCountPerSessionPerParty(){
        const sortedPlenarySessions = this.plenarySessions.sort(function (a, b) {
            if (a.sessionNumber > b.sessionNumber) {
                return 1;
            }
            if (b.sessionNumber > a.sessionNumber) {
                return -1;
            }
            return 0;
        });

        let valueMap = new Map()
        sortedPlenarySessions.map(ps => {
            ps.speeches.flatMap(s => s.comments).forEach ( comment => {
                let partyList = valueMap.get(comment.party)   
                if(!partyList){
                    let newValue = []
                    newValue[ps.sessionNumber - 1] = 1
                    valueMap.set(comment.party, newValue)
                } else {
                    partyList[ps.sessionNumber - 1] = partyList[ps.sessionNumber - 1] + 1
                }      
            })
        })

        let result = []
        Array.from(valueMap.keys()).forEach(key => {
            result.push({
                party : key,
                values : valueMap.get(key)
            })
        })

        console.log(result)
        return result
        

            // .map(ps => {
            //     ps.sessionNumber

            //     ps.speeches
            // }
            //     )
            // .flatMap(s => s.comments)

        // return [
        //     {"party" : "AfD", "values": [100, 120, 78, 19, 209] },
        //     {"party" : "CDU/CSU", "values": [90, 20, 30, 10, 431] },
        //     {"party" : "BÜNDNIS 90/DIE GRÜNEN", "values": [90, 10, 200, 123, 100] },
        //     {"party" : "Linke", "values": [90, 10, 200, 100, 65] },
        //     {"party" : "FDP", "values": [90, 10, 200, 123, 12] },
        //     {"party" : "SPD", "values": [90, 10, 200, 99, 171] }
        //    ];
    }

}

module.exports = DataBase











