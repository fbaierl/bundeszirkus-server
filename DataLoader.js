const fileSystem = require('fs')
const DOMParser = new (require('xmldom')).DOMParser
const logger = require('./logger')

const knowledge = require('./knowledge')
const aH = require('./arrayHelper')
const xmlUtil = require('./xmlUtil')
const Comment = require('./model/Comment')
const Speaker = require('./model/Speaker')
const PlenarySession = require('./model/PlenarySession')
const DataBase = require('./DataBase')


/**
 * The database where all data will be stored.
 */
const dataBase = new DataBase([])



function applySearchParams(comments, searchParams){
    let result = comments
    if(searchParams.speakerFullname && searchParams.speakerFullname != ""){
        result = result.filter(f => f.speaker.fullname.toLowerCase().includes(searchParams.speakerFullname.toLowerCase()))
    }
    if(searchParams.speakerPartyOrRole && searchParams.speakerPartyOrRole != ""){
        result = result.filter(f => (f.speaker.party && f.speaker.party.toLowerCase().includes(searchParams.speakerPartyOrRole.toLowerCase()) ||
                                    (f.speaker.role && f.speaker.role.toLowerCase().includes(searchParams.speakerPartyOrRole.toLowerCase()))))
    }
    if(searchParams.commentFullname && searchParams.commentFullname != ""){
        result = result.filter(f => f.comment.fullname.toLowerCase().includes(searchParams.commentFullname.toLowerCase()))
    }
    if(searchParams.commentParty && searchParams.commentParty != ""){
        result = result.filter(f => f.comment.party.toLowerCase().includes(searchParams.commentParty.toLowerCase()))
    }
    if(searchParams.commentText && searchParams.commentText != ""){
        result = result.filter(f => f.comment.text.toLowerCase().includes(searchParams.commentText.toLowerCase()))
    }
    return result
}


class DataLoader{



    /**
     * This method should be called before the server starts listening to requests 
     * in order to load all data neccessary.
     * @param {function} callback 
     */
    loadData(callback){
        var dirPath = "data"
        var files = ""
        logger.info("[loader] loading data ...")
        fileSystem.readdir(dirPath, function(err, files) {
            if(err){
                return callback(err);
            }
            logger.info("[loader] loading files:" + files)
            
            let plenarySessions = files.map(file => {
                let filePath = dirPath + "/" + file
                let fileContent = fileSystem.readFileSync(filePath, "utf8")
                let document = DOMParser.parseFromString(fileContent, "application  /xml");
                return PlenarySession.fromXml(document)
            })
            dataBase.reset()
            dataBase.update(plenarySessions)    
            if(callback){
                callback()
            }
        });
    }

    // /**
    //  * Loads the data in a single file.
    //  * @param {string} dirPath 
    //  * @param {string} fileName 
    //  */
    // _loadFile(dirPath, fileName){
    //     let filePath = dirPath + "/" + fileName
    //     var fileContent = fileSystem.readFileSync(filePath, "utf8")
    //     var document = DOMParser.parseFromString(fileContent, "application  /xml");
    //     return PlenarySession.fromXml(document)
    // }

    commentsSlice(start, length, searchParameters){
        // let dataToSend = applySearchParams(allComments, searchParameters)
        // let recordsFiltered = dataToSend.length
        // dataToSend = dataToSend.slice(start, start + length).map(function(elem){
        //     // combine party and role to one field here for easier display
        //     const { speaker, comment } = elem;
        //     return  { speaker:{
        //                 fullname: speaker.fullname, 
        //                 partyOrRole: speaker.party + speaker.role, // only one of those is not an empty string 
        //             },
        //             comment: comment
        //             }
        // })
        // return {data: dataToSend, 
        //         recordsTotal: allComments.length,
        //         recordsFiltered: recordsFiltered
        //     }
    }

    comments(){
        // return {data:allComments.map(function(elem){
        //     const { speaker, comment } = elem;
        //     // combine party and role to one field here for easier display
        //     return  { speaker: {
        //                 fullname: speaker.fullname, 
        //                 partyOrRole: speaker.party + speaker.role, // only one of those is not an empty string 
        //             },
        //             comment: comment
        //             }
        // })}
    }

    random(){
        // return allComments[Math.floor(Math.random() * allComments.length)]
    }

    statsTotalParties(){
        // return totalCommentsPerParty.map(function(e, i) {
        //     let c = knowledge.partyColor(e.party)
        //     return {
        //         party: e.party,
        //         occurences: e.occurences,
        //         color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
        //     }
        // }); 
    }

    statsTotalPoliticians(){
        // return totalCommentsPerPolitician.map(function(e, i) {
        //     let c = knowledge.partyColor(e.party)
        //     return {
        //         fullname: e.fullname,
        //         party: e.party,
        //         occurences: e.occurences,
        //         color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
        //     }
        // }); 
    }

    statsTotalPartiesPassive(){
        // return totalCommentsPerPartyPassive.map(function(e, i) {
        //     let c = knowledge.partyColor(e.party)
        //     return {
        //         party: e.party,
        //         occurences: e.occurences,
        //         color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
        //     }
        // });
    }

    statsTotalPoliticiansPassive(){
        // return totalCommentsPerPoliticianPassive.map(function(e, i) {
        //     let c = knowledge.partyColor(e.party)
        //     return {
        //         fullname: e.fullname,
        //         party: e.party,
        //         occurences: e.occurences,
        //         color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
        //     }
        // }); 
    }

}

module.exports = DataLoader