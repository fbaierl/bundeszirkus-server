/**
 * replaces all white space characters with the standard ' ' char.
 * @param {Text} string 
 */
exports.cleanWhiteSpaces = function(string){
    return string.replace(/\s/g, ' ')
} 