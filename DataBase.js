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
        this.totalCommentsCountPerSessionPerParty = this._findTotalCommentsCountPerSessionPerParty()
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

    _groupBy(xs, key) {
        return xs.reduce(function(rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };

    _onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
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
        })

        const commentsPerSessionGrouped = 
                sortedPlenarySessions
                    .map(ps =>
                        this._groupBy(ps.speeches.flatMap(s => s.comments), 'party')
                    )
                        
        const partyAndCountPerSession = commentsPerSessionGrouped.map(session => {
            return Object.entries(session).map(([party, comments]) => {
                return  {
                    party : party,
                    count : comments.length
                }
        })})

        const partiesUnique = [... new Set(partyAndCountPerSession.flatMap(x => x.flatMap(y => y.party)))]

        return partiesUnique.map(party => {
            return {
                party: party,
                values: partyAndCountPerSession.map(session => {
                    const keyValuePair = session.find(element => element.party === party)
                    if(keyValuePair){
                        return keyValuePair.count
                    } else {
                        return 0
                    }
                } )
            }
            
        })
    }

}

module.exports = DataBase











