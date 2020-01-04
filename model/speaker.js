var modelUtil = require('./modelUtil.js')

function Speaker(fullname, party, role) {
        this.fullname = fullname
        this.party = modelUtil.cleanUpParty(party)
        this.role = role
}

module.exports = Speaker