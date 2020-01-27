const modelUtil = require('./modelUtil')
const xmlUtil = require('../xmlUtil')
const knowledge = require('../knowledge')


class Speaker {
        constructor(fullname, party, role){
                this.fullname = fullname
                this.party = party
                this.role = role
        }

        /**
         * Sometimes cities like 'Bremen' are used in the <fraktion>-tag, so this function checks
         * if a party is really a valid party.
         *  
         * @param {*} party name of the party
         */
        static _checkParty(party){
                return knowledge.validParties
                        .map(p => p.toLowerCase())
                        .includes(party.toLowerCase())
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
        static fromXml(xml){
                // each speaker has a first and a last name
                let firstnames = xmlUtil.findValues("vorname", xml)
                let lastnames = xmlUtil.findValues("nachname", xml)
                // in rare cases the xml may be broken...
                if(firstnames.length <= 0 || lastnames <= 0) {
                        return  
                } 
                let firstname = firstnames[0].trim()
                let lastname = lastnames[0].trim()
                // each speaker has either information about their fraction OR their role
                let role = ""
                let party = ""
                let roles = xmlUtil.findValues("rolle_lang", xml)
                let parties = xmlUtil.findValues("fraktion", xml)
                if(roles.length > 0){
                        role = roles[0].trim()
                        // sometimes the role is included in the firstname, so we remove it here
                        firstname = firstname.replace(role, "").trim()
                } else if (parties.length > 0){
                        party = modelUtil.cleanUpParty(parties[0].trim())
                        if(!this._checkParty(party)){
                                return
                        }
                } else {
                        logger.info("[loader] Couldn't find role or party for speaker: " + firstname + " " +  lastname)
                }     
                return new Speaker(firstname + " " + lastname, party, role)
        }
}

module.exports = Speaker