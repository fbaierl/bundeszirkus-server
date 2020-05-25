const fileSystem = require('fs')
const DOMParser = new (require('xmldom')).DOMParser
const logger = require('./logger')
const path = require('path')

const knowledge = require('./knowledge')
const PlenarySession = require('./model/PlenarySession')
const DataBase = require('./DataBase')


/**
 * The database where all data will be stored.
 */
const dataBase = new DataBase([])


class DataLoader {


    /**
     * This method should be called before the server starts listening to requests 
     * in order to load all data neccessary.
     * @param {function} callback 
     */
    loadDataSync(dataDirPath){
        logger.info("[loader] loading data ...")
        let files = fileSystem.readdirSync(dataDirPath)
        if(!files){
            logger.error("[loader] error happened reading data dir.", err)
        }
        logger.info("[loader] loading " + files.length + " files.")
        logger.debug("[loader] loading files:" + files)
        let plenarySessions = files.map(file => {
            let xml = this._readXmlFile(path.join(dataDirPath, file))
            return PlenarySession.fromXml(xml)
        })
        dataBase.reset()
        dataBase.update(plenarySessions)
    }

    /**
     * Reads an XML file.
     * @param {*} filePath path to file
     */
    _readXmlFile(filePath){
        let fileContent = fileSystem.readFileSync(filePath, "utf8")
        return DOMParser.parseFromString(fileContent, "application  /xml");
    }

    _applySearchParams(comments, searchParams){
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


    commentsSlice(start, length, searchParameters){
        let allComments = dataBase.allCommentsWithSpeaker
        let dataToSend = this._applySearchParams(allComments, searchParameters)
        let recordsFiltered = dataToSend.length
        dataToSend = dataToSend.slice(start, start + length).map(function(elem){
            // combine party and role to one field here for easier display
            const { speaker, comment } = elem;
            return  { speaker:{
                        fullname: speaker.fullname, 
                        partyOrRole: speaker.party + speaker.role, // only one of those is not an empty string 
                    },
                    comment: comment
                    }
        })
        return {data: dataToSend, 
                recordsTotal: allComments.length,
                recordsFiltered: recordsFiltered
            }
    }

    allComments(){
        return { data: dataBase.allComments.map(function(elem){
            const { speaker, comment } = elem;
            // combine party and role to one field here for easier display
            return  { speaker: {
                        fullname: speaker.fullname, 
                        partyOrRole: speaker.party + speaker.role, // only one of those is not an empty string 
                    },
                    comment: comment
                    }
        })}
    }

    /**
     * Returns a random comment
     */
    randomComment(){
        let allComments = dataBase.allCommentsWithSpeaker
        return allComments[Math.floor(Math.random() * allComments.length)]
    }

    statsTotalParties(){
        return dataBase.totalCommentsPerParty.map(function(e, i) {
            let c = knowledge.partyColor(e.party)
            return {
                party: e.party,
                occurences: e.occurences,
                color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
            }
        }); 
    }

    statsTotalPoliticians(){
        return dataBase.totalCommentsPerPolitician.map(function(e, i) {
            let c = knowledge.partyColor(e.party)
            return {
                fullname: e.fullname,
                party: e.party,
                occurences: e.occurences,
                color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
            }
        }); 
    }

    statsTotalPartiesPassive(){
        return dataBase.totalCommentsPerPartyPassive.map(function(e, i) {
            let c = knowledge.partyColor(e.party)
            return {
                party: e.party,
                occurences: e.occurences,
                color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
            }
        });
    }

    statsTotalPoliticiansPassive(){
        return dataBase.totalCommentsPerPoliticianPassive.map(function(e, i) {
            let c = knowledge.partyColor(e.party)
            return {
                fullname: e.fullname,
                party: e.party,
                occurences: e.occurences,
                color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
            }
        }); 
    }

    statsTotalCommentsCountPerSessionPerParty(){
        return dataBase.totalCommentsCountPerSessionPerParty.map(function(e, i) {
            let c = knowledge.partyColor(e.party)
            return {
                party: e.party,
                values: e.values,
                color: 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.75)'
            }
        })
    }

    plenarySessions(){
        return dataBase.plenarySessions
    }

}

module.exports = DataLoader