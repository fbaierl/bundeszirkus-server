/**
 * Comparator function to sort an object-array according to its fullname parameter.
 * @param {*} a 
 * @param {*} b 
 */
function sortByFullname(a, b) {
    var nameA = a.fullname.toUpperCase(); // ignore upper and lowercase
    var nameB = b.fullname.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
}

/**
 * Comparator function to sort an object-array according to its party parameter.
 * @param {*} a 
 * @param {*} b 
 */
function sortByParty(a, b) {
    var nameA = a.party.toUpperCase(); // ignore upper and lowercase
    var nameB = b.party.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
}

/**
 * Takes a list of {party: xxx} objects and returns a list looking like this:
 * [{party: xxx, occurences: xxx}] where party is unique and occurences is the number of
 * occurences this party has appeared in the input list.
 * @param {*} data [{party: xxx}]
 * @returns [{party: xxx, occurences: xxx}]
 */
exports.findOccurencesOfParties = function(data) {
    data.sort(sortByParty);
    var result = [], prevParty;
    // data needs to be sorted by fullname before this loop
    for (var i = 0; i < data.length; i++) {
        if (data[i].party !== prevParty) {
            // first time we see this politician
            result.push({party: data[i].party, occurences: 1 });
        }
        else {
            // add one to occurences
            let entry = result[result.length - 1];
            entry.occurences++;
            result[result.length - 1] = entry;
        }
        prevParty = data[i].party;
    }
    return result
}

/**
 * Takes a list of {fullname: xxx, party: xxx} objects and returns a list looking like this:
 * [{fullname: xxx, party: xxx, occurences: xxx}] where fullname is unique and occurences is the number of
 * occurences this politician has appeared in the input list.
 * @param {*} data [{fullname: xxx, party: xxx}]
 * @returns [{fullname: xxx, party: xxx, occurences: xxx}]
 */
exports.findOccurencesOfPoliticians = function(data) {
    data.sort(sortByFullname);
    var result = [], prevName;
    // data needs to be sorted by fullname before this loop
    for (var i = 0; i < data.length; i++) {
        if (data[i].fullname !== prevName) {
            // first time we see this politician
            result.push({fullname: data[i].fullname, party: data[i].party, occurences: 1 });
        }
        else {
            // add one to occurences
            let entry = result[result.length - 1];
            entry.occurences++;
            result[result.length - 1] = entry;
        }
        prevName = data[i].fullname;
    }
    return result
}


