/**
 * Finds basic (non-hierarchical) elements in an XML and returns its value. 
 * @param {*} element the nodes name to search the values for
 * @param {*} xml the xml to search in
 */
function findValues(element, xml) {
    var output = [];
    if(!xml || !xml.childNodes){
        return output;
    }
    var nodes = xml.childNodes;
    if (nodes != null) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeName == element && 
                nodes[i].childNodes.length == 1 && 
                nodes[i].childNodes[0].nodeValue) {
                output.push(nodes[i].childNodes[0].nodeValue);
            } else {
                output = output.concat(findValues(element, nodes[i]));
            }
        }
    }
    return output;
}

/**
 * Finds all nodes with the tag nodename in an XML.
 * Returns a list of nodes.
 * @param {*} nodeName the node's name to search for 
 * @param {*} xml
 */
function findNodes(nodeName, xml){
    var output = []
    if(!xml || !xml.childNodes){
        return output
    }
    var nodes = xml.childNodes
    if(nodes){
        for (var i = 0; i < nodes.length; i++) {
            if(nodes[i].nodeName == nodeName){
                 output.push(nodes[i])
            } else {
                output = output.concat(findNodes(nodeName, nodes[i]));
            }
        }
    }
    return output;
}

exports.findValues = findValues
exports.findNodes = findNodes