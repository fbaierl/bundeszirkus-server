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
 * Takes a list of {fullname: xxx, party: xxx} objects and returns a list looking like this:
 * [{fullname: xxx, party: xxx, occurences: xxx}] where fullname is unique and occurences is the number of
 * occurences this politician has made a comment.
 * @param {*} data [{fullname: xxx, party: xxx}]
 * @returns [{fullname: xxx, party: xxx, occurences: xxx}]
 */
exports.findOccurencesOfPoliticiansCommenting = function(data) {
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


/**
 * TODo doc
 * @param {*} data 
 */
exports.findOccurences = function(data){

    data.sort()

    var a = [], b = [], prev;
    for (var i = 0; i < data.length; i++ ) {
        if ( data[i] !== prev ) {
            a.push(data[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = data[i];
    }

    return [a, b]
}

