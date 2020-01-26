const assert = require('assert');
const ah = require('../DataBase')
const Speech = require('../model/Speech')
const Speaker = require('../model/Speaker')
const Comment = require('../model/Comment')


let speaker1 = new Speaker('Dr. Hermann Otto Solms', '', 'Alterspräsident')
let speaker2 = new Speaker('Carsten Schneider', 'SPD', '')
let speaker3 = new Speaker('Bernd Baumann', 'AfD', '')
let speaker4 = new Speaker('Jan Korte', 'DIE LINKE', '')
let speaker5 = new Speaker('Michael Grosse-Brömer', 'CDU/CSU', '')
let speaker6 = new Speaker('Marco Buschmann', 'FDP', '')
let speaker7 = new Speaker('Britta Haßelmann', 'BÜNDNIS 90/DIE GRÜNEN', '')
let speaker8 = new Speaker('Volker Kauder', 'CDU/CSU', '')
let speaker9 = new Speaker('Wolfgang Schäuble', 'CDU/CSU', '')
let speaker10 = new Speaker('Hans-Peter Friedrich', 'CDU/CSU', '')
let speaker11 = new Speaker('Thomas Oppermann', 'SPD', '')
let speaker12 = new Speaker('Wolfgang Kubicki', 'FDP', '')
let speaker13 = new Speaker('Petra Pau', 'DIE LINKE', '')
let speaker14 = new Speaker('Claudia Roth', 'BÜNDNIS 90/DIE GRÜNEN', '')
let speaker15 = new Speaker('Wolfgang Schäuble', '', 'Präsident')
let speech1 = new Speech(speaker1, [])
let speech2 = new Speech(speaker1, [])
let speech3 = new Speech(speaker2, [new Comment('Katrin Göring-Eckardt', 'BÜNDNIS 90/DIE GRÜNEN', 'Was?'),
                                    new Comment('Volker Kauder', 'CDU/CSU', 'Warum habt ihr das bei Gerhard Schröder nicht gemacht?')])
let speech4 = new Speech(speaker3, [new Comment('Dr. Marco Buschmann', 'FDP', 'Traditionen wollten Sie doch direkt brechen!?'),
                                    new Comment('Christian Lindner', 'FDP', 'Stimmt gar nicht!'),
                                    new Comment('Martin Schulz', 'SPD', 'Da kennt ihr euch ja aus!'),
                                    new Comment('Michael Theurer', 'FDP', 'Rabulisten!')])
let speech5 = new Speech(speaker4, [])    
let speech6 = new Speech(speaker5, [new Comment('Ulli Nissen', 'SPD', 'Wie viel haben Sie denn verloren?'),
                                    new Comment('Martin Schulz', 'SPD', 'Wir helfen gerne!'),
                                    new Comment('Martin Schulz', 'SPD', 'Ach!'),
                                    new Comment('Matthias W. Birkwald', 'DIE LINKE', 'Wer kontrolliert denn die?'),
                                    new Comment('Carsten Schneider', 'SPD', 'Wir sind es schon!'),
                                    new Comment('Jan Korte', 'DIE LINKE', 'Müssen wir aber!'),
                                    new Comment('Dr. Petra Sitte', 'DIE LINKE', 'Was ist denn mit dem Petitionsrecht?'),
                                    new Comment('Dr. Petra Sitte', 'DIE LINKE', 'Was ist denn mit dem Petitionsrecht?'),
                                    new Comment('Matthias W. Birkwald', 'DIE LINKE', 'Es gibt kein Ministerium für die Opposition, Herr Kollege!')])
let speech7 = new Speech(speaker6, [new Comment('Petra Pau', 'DIE LINKE', 'Gucken Sie mal in das Grundgesetz!'),
                                    new Comment('Matthias W. Birkwald', 'DIE LINKE', 'Unverschämtheit!')])                 
let speech8 = new Speech(speaker7, [new Comment('Claudia Roth', 'BÜNDNIS 90/DIE GRÜNEN', 'Ja, das habe ich mich auch gefragt!'),
                                    new Comment('Michael Grosse-Brömer', 'CDU/CSU', 'Das passiert, wenn man das nicht ordentlich vorbereitet!'),
                                    new Comment('Jan Korte', 'DIE LINKE', 'Ihr habt noch keinen Koalitionsvertrag!'),
                                    new Comment('Petra Pau', 'DIE LINKE', 'Weil es im Grundgesetz steht!'),
                                    new Comment('Michael Grosse-Brömer', 'CDU/CSU', 'Gute Frage!'),
                                    new Comment('Jan Korte', 'DIE LINKE', 'Das können wir doch ergänzen!'),
                                    new Comment('Dr. Dietmar Bartsch', 'DIE LINKE', 'Ihr seid noch nicht an der Regierung! Noch nicht!'),
                                    new Comment('Martin Schulz', 'SPD', 'Jamaika steht!')])
let speech9 = new Speech(speaker8, [])  
let speech10 = new Speech(speaker1, [])
let speech11 = new Speech(speaker9, [])
let speech12 = new Speech(speaker1, [])
let speech13 = new Speech(speaker9, [new Comment('Martin Schulz', 'SPD', 'Im „Silbernen Stern“!')])
let speech14 = new Speech(speaker10, [])
let speech15 = new Speech(speaker11, [])
let speech16 = new Speech(speaker12, [])
let speech17 = new Speech(speaker13, [])
let speech18 = new Speech(speaker14, [])
let speech19 = new Speech(speaker15, [])

/**
 * Contains the data from '19001-data.xml'
 */
let sessionsData = [speech1, speech2, speech3, speech4, speech5, speech6, speech7, speech8, speech9, speech10, speech11, speech12, speech13, speech14, speech15, speech16, speech17, speech18, speech19]
  

// TODO use data to test