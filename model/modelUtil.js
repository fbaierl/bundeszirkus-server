
exports.cleanUpFullName = function(raw) {
    let detectRectangleBracketsAtTheEndOfStringRegex = /(.*)(\[.*?\]$)/g
    let match = detectRectangleBracketsAtTheEndOfStringRegex.exec(raw)
    if(match !== null){
        // if we matched there is a city name after the name (e.g. Carsten Schneider [Erfurt]) so we replace it here
        raw = raw.replace(match[2].trim(), "").trim()
    }
    return raw
        // ... in case fullname is e.g. "Gegenruf des Abg. Karsten Hilse"
        .replace(/Gegenrufe? de(s|r) Abg[.]?/, "")
        // ... in case fullname has a predeceding "Abg" or "Abg."
        .replace(/Abg.?/,"")
} 

exports.cleanUpParty = function(raw) {
   // work-around for a faulty raw xml file (19046-data.xml)
   if(raw === "BÜNDNIS 90/D" || raw.toLowerCase().includes("die grünen")){
       raw = "BÜNDNIS 90/DIE GRÜNEN"
   }
   if(raw.toLowerCase() === "fraktionslos"){
       raw = "Fraktionslos"
   }
   return raw
}