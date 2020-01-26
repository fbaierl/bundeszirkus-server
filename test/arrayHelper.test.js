const assert = require('assert');
const ah = require('../arrayHelper')

describe('findOccurencesOfParties should work correctly', () => {

    it('should work with a simple input sample', () => {
        let input = [
        { party: 'SPD' },
        { party: 'SPD' },
        { party: 'AfD' },
        { party: 'AfD' },
        { party: 'AfD' },
        { party: 'AfD' },
        { party: 'CDU/CSU' },
        { party: 'CDU/CSU' },
        { party: 'CDU/CSU' },
        { party: 'CDU/CSU' },
        { party: 'CDU/CSU' },
        { party: 'CDU/CSU' },
        { party: 'CDU/CSU' },
        { party: 'CDU/CSU' },
        { party: 'FDP' },
        { party: 'FDP' },
        { party: 'BÜNDNIS 90/DIE GRÜNEN' },
        { party: 'BÜNDNIS 90/DIE GRÜNEN' },
        { party: 'BÜNDNIS 90/DIE GRÜNEN' },
        { party: 'BÜNDNIS 90/DIE GRÜNEN' },
        { party: 'BÜNDNIS 90/DIE GRÜNEN' },
        { party: 'BÜNDNIS 90/DIE GRÜNEN' },
        { party: 'BÜNDNIS 90/DIE GRÜNEN' },
        { party: 'BÜNDNIS 90/DIE GRÜNEN' }]

        let result = ah.findOccurencesOfParties(input)
            
        let checkParty = function(party, occurences) {
            let found = false
            for(var i = 0; i < result.length; i++) {
                if (result[i].party == party) {
                    found = true;
                    assert(result[i].occurences == occurences)
                    break;
                }
            }
            return found
        }
          
        assert(checkParty('AfD', 4))
        assert(checkParty('BÜNDNIS 90/DIE GRÜNEN', 8))
        assert(checkParty('CDU/CSU', 8))
        assert(checkParty('FDP', 2))
        assert(checkParty('SPD', 2))

    })


})