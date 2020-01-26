const aH = require('./arrayHelper')
const util = require('util')


class DataBase {


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
    
    constructor(plenarySessions){
        this.update(plenarySessions) // TODO date is undefined?????
    }

    reset(){
        this.update([])
    }

    update(plenarySessions){
        this.plenarySessions = plenarySessions
        this._calculateStatisticalData()
    }

    /**
     * Calculates all the data needed and keeps it in memory.
     */
    _calculateStatisticalData() {
        this.allComments = this.plenarySessions.flatMap(ps => ps.speeches).flatMap(s => s.comments)
        this.totalCommentsPerParty = this._findCommentsPerParty()
        this.totalCommentsPerPolitician = this._findCommentsPerPolitician(this.allComments).slice(0,20)
        this.totalCommentsPerPartyPassive = this._findCommentsPerPartyPassive(this.allComments)
        this.totalCommentsPerPoliticianPassive = this._findCommentsPerPoliticianPassive(this.allComments).slice(0,20)
    }

    /**
     * @returns {Object[]} comments per political party stats
     */
    _findCommentsPerParty(){ 

        console.log(util.inspect(this.plenarySessions, {showHidden: false, depth: null}))

        let x  = this.plenarySessions
            .flatMap(ps => ps.speeches)
            .flatMap(speech => speech.comments.map( function(comment) {
                return { party: speech.speaker.party}}))
        console.log(x)

        let result = aH.findOccurencesOfParties(
            x
        ).sort(function (a, b) {
            return b.occurences - a.occurences;
        })
        console.log("hello world")
        console.log(x)
        return x
    }

    _findCommentsPerPartyPassive(allComments){
        // TODO commnts no langer has speaker



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
    _findCommentsPerPolitician(allComments){
        return aH.findOccurencesOfPoliticians(
            allComments.map(function(comment) {
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

    _findCommentsPerPoliticianPassive(allComments){
        return aH.findOccurencesOfPoliticians(
            allComments
            // use speaker
            .map(function(comment) {
                return { 
                    fullname: comment.speaker.fullname,
                    party: comment.speaker.party + elem.speaker.role  // only one of those is not an empty string 
                }
            })
        )
        .sort(function (a, b) {
            return b.occurences - a.occurences;
        })
    }





}

module.exports = DataBase











