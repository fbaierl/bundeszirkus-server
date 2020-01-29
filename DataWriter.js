const logger = require('./logger')
const fileSystem = require('fs')

/**
 * The DataWriter is responsible for writing data to a file. 
 */
class DataWriter {

    writeJSONSync(filePath, jsonContent){
        logger.info("[writer] writing to file " + filePath + ".")
        fileSystem.writeFileSync(filePath, JSON.stringify(jsonContent), function (err) {
            if (err) {
                logger.error("[writer] error happened while writing file.", err)
            }
            logger.info("[writer] finished writing to file: " + filePath + ".")
          });
    }

}

module.exports = DataWriter