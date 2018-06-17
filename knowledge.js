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