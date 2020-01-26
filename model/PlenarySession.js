const xmlUtil = require('../xmlUtil')
const Speech = require('./Speech')

class PlenarySession {

    constructor(date, sessionNumber, electionPeriod, speeches) {
        this.date = date,
        this.sessionNumber = sessionNumber,
        this.electionPeriod = electionPeriod,
        this.speeches = speeches
    }
    
    static fromXml(xml){
        let header = PlenarySession._structureHeaderDataXml(xml)
        let speeches = xmlUtil.findNodes("rede", xml)
        .map(speechXml => Speech.fromXml(speechXml, header.sessionNumber))
        .filter(function (el) { // this will filter out null and undefined (which may heppen if the XML is broken)
            return el != null;
          });
        return new PlenarySession(header.data, header.sessionNumber, header.electionPeriod, speeches)
    }

    /**
     * Transforms a header data (<kopfdaten>) xml tag into json.
     * 
     * example: 
     * 
     * <kopfdaten>
     *   <plenarprotokoll-nummer>Plenarprotokoll <wahlperiode>19</wahlperiode>/<sitzungsnr>14</sitzungsnr></plenarprotokoll-nummer>
     *   <herausgeber>Deutscher Bundestag</herausgeber>
     *   <berichtart>Stenografischer Bericht</berichtart>
     *   <sitzungstitel><sitzungsnr>14</sitzungsnr>. Sitzung</sitzungstitel>
     *   <veranstaltungsdaten><ort>Berlin</ort>, <datum date="22.02.2018">Donnerstag, den 22. Februar 2018</datum></veranstaltungsdaten>
     * </kopfdaten>
     * 
     * will return: { date: 22.02.2018, electionPeriod: 19, sessionNumber: 14 }
     * 
     * @param {*} headerDataXml the header data xml
     * @return { date: xxx, electionPeriod: xxx, sessionNumber: xxx }
     */
    static _structureHeaderDataXml(headerDataXml){
        let datumNode = xmlUtil.findNodes("datum", headerDataXml)[0]
        var date = undefined // TODO 
        if(datumNode) {
            date = datumNode.getAttribute("date") 
        }
        let sessionNumber = xmlUtil.findValues("sitzungsnr", headerDataXml)[0]
        let electionPeriod = xmlUtil.findValues("wahlperiode", headerDataXml)[0]
        return { date: date, sessionNumber: sessionNumber, electionPeriod: electionPeriod }
    }

}

module.exports = PlenarySession