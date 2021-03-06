/*
 * This file contains all kind of knowledge not included in the data files.
 */

/**
 * RGB color for each party
 * @param partyName 
 */
exports.partyColor = function(partyName){
    let name = partyName.toLowerCase()
    if(name.includes('afd')){
        return [0, 159, 225]
    } else if(name.includes('spd')){
        return [227, 0, 15]
    } else if(name.includes('fdp')){
        return [255, 214, 0]
    } else if(name.includes('linke')){
        return [237, 28, 36]
    } else if(name.includes('cdu')){
        return [0, 0, 0]
    } else if(name.includes('grün')){
        return [76, 184, 72]
    } else if(name.includes('fraktionslos')){
        return [125, 125, 125]
    } else {
        return [50, 50, 50] 
    }    
}

exports.allParties = 
['AfD', 'CDU/CSU', 'BÜNDNIS 90/DIE GRÜNEN', 'FDP', 'SPD', 'DIE LINKE', 'FRAKTIONSLOS']


/**
 * Sometimes cities like 'Bremen' are used in the <fraktion>-tag, so this function checks
 * if a party is really a valid party.
 *  
 * @param {*} party name of the party
 */
exports.isValidParty = function(party) {
    let validParties = ['AfD', 'CDU/CSU', 'CDU', 'CSU', 'BÜNDNIS 90/DIE GRÜNEN', 'FDP', 'SPD', 'DIE LINKE', 'FRAKTIONSLOS']
    return validParties
            .map(p => p.toLowerCase())
            .includes(party.toLowerCase())
}