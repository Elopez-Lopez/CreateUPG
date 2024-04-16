const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const topNodeRegex = /OBJECT Table (\d{1,5}) (\w{1,30})/;
const firstFieldLineRegex = /\{\s*\d+\s*;\s*;\s*.*\s*;/;
const midNodeArray = ['OBJECT-PROPERTIES', 'PROPERTIES', 'FIELDS', 'KEYS', 'FIELDGROUPS', 'CODE'];
const arrayNodes = ['FIELDS', 'KEYS', 'FIELDGROUPS'];

// Elimina los caracteres no permitidos en los nombres de los campos
function removeDisallowedCharacters(str) {
    const allowedRegex = /^[A-Za-z0-9\/\-_. ]+$/;
    let cleanedStr = '';

    for (let char of str) {
        if (allowedRegex.test(char)) {
            cleanedStr += char;
        }
    }

    return cleanedStr;
}

// Comprueba si un objeto está vacío
const isObjectEmpty = (objectName) => {
    return (
      objectName &&
      Object.keys(objectName).length === 0 &&
      objectName.constructor === Object
    );
};

// Initialize a new file (or overwrite an existing one)
function initializeFile(filePath) {
    fs.writeFile(filePath, '', (err) => {
        if (err) {
            console.error('Error initializing file:', err);
            return(false);
        }
    });
    return(true);
}

// Add a line to a file
function addLineToFile(filePath, line) {
    fs.appendFileSync(filePath, line + '\n', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        }
    });
}

// Coge el objeto tabla y construye un objeto JSON con las propiedades de la tabla
function copyToObject(contents) {
    const lines = contents.split('\r\n');
    let MultResult = [];
    let resultJson = {};
    let tableHeader = '';
    // Section vars
    let currentSection = '';
    let inSection, findSection = false;
    // Key vars
    let newKey = {};
    let currentKey = 0;
    let inKey, firstKeyLine = false;
    // Field vars
    let newField = {};
    let currentField, fieldCloseDelay = 0;
    let inField, firstFieldLine = false;
    let fieldReference = false;

    for (let line of lines) {
        line = line.trim();
        fieldReference = false;

        // Esta condicion se encarga de copiar las propiedades de cada seccion
        if (inSection) {
            switch (currentSection) {
                case 'OBJECT-PROPERTIES':
                    if (line.includes('=')) {
                        let [key, value] = line.split('=');
                        resultJson[tableHeader][currentSection][key] = value;
                    }
                    break;
                case 'PROPERTIES':

                    break;
                case 'FIELDS':
                    if (firstFieldLineRegex.test(line) && !inField) {
                        inField = true;
                        firstFieldLine = true;
                        currentField ++;
                        fieldReference = true;
                    }

                    // Si hay un corchete de apertura se entiende que hay un comentario y se incrementa el contador
                    if (inField && line.includes('{') && !firstFieldLine) {
                        fieldCloseDelay ++; 
                    }

                    if (inField && firstFieldLine) {
                        let [number, blank, name, type, other] = line.split(';');
                        number = number.replace('{', '');
                        let fieldName = removeDisallowedCharacters(name.trim()).replace('}', '');
                        newField = {
                            'number': number.trim(),
                            'name': fieldName,
                            'type': type.trim().replace('}', ''),
                            'other': ''
                        };
                    }
                    if (line.includes('OptionString')) { 
                        newField.other = line.replace('}', '').trim();
                    }

                    firstFieldLine = false;

                    if (line.includes('}') && inField && fieldCloseDelay == 0) {
                        resultJson[tableHeader][currentSection].push(newField);
                        inField = false;
                        fieldReference = true;
                    }

                    // Si hay un corchete de cierre se decrementa el contador
                    if (inField && line.includes('}') && fieldCloseDelay > 0) {
                        fieldCloseDelay --;
                        fieldReference = true;
                    }

                    break;
                case 'KEYS':
                        if (line.includes('{') && !inKey) {
                            inKey = true;
                            firstKeyLine = true;
                            currentKey ++;
                        }

                        if (inKey && firstKeyLine) {
                            let [enabled, includedFields, other] = line.split(';');
                            let arrayIncludedFields = includedFields.split(',');
                            arrayIncludedFields = arrayIncludedFields.map(item => removeDisallowedCharacters(item.replace('{', '').replace('}', '').trim()));
                            newKey = {
                                'keyCount': currentKey,
                                'clustered' : false,
                                'includedFields': arrayIncludedFields
                            };
                        }

                        firstKeyLine = false;
                        if (line.includes('Clustered')) {
                            newKey.clustered = true;
                        }

                        if (line.includes('}') && inKey) {
                            resultJson[tableHeader][currentSection].push(newKey);
                            inKey = false;
                        }
                        break;
                case 'FIELDGROUPS':

                    break;
                case 'CODE':

                    break;
            }
        }

        // Esta parte se encarga de analizar las propiedades del objeto tabla
        if (topNodeRegex.test(line)) {
            if (!isObjectEmpty(resultJson)) {
                MultResult.push(resultJson);
            }
            currentKey = 0;
            resultJson = {};

            // Esta condicion existe solo para buscar la cabecera
            tableHeader = line;
            resultJson[line] = {};
            // Indica que no hay seccion justo debajo de esta
            findSection = false;

        } else if (findSection && (line == '{') && !inField && !fieldReference && !inKey) {
            // Esta línea encuentra el inicio de cada seccion
            inSection = true;

        } else if (findSection && (line == '}') && !inField && !fieldReference && !inKey) {
            // Esta línea encuentra el final de cada seccion
                inSection = false;
                currentSection = ''; 

        } else if (midNodeArray.includes(line)) {
            if (arrayNodes.includes(line)) {
                resultJson[tableHeader][line] = [];
            } else {
                resultJson[tableHeader][line] = {};
            }
            // Indica que hay una seccion justo debajo de esta
            findSection = true;
            currentSection = line;

        }
    }

    // Para insertar el último objeto
    MultResult.push(resultJson);
    return MultResult;
}

// Escribe el contenido de un objeto JSON en un archivo
function WriteJSONDataToFile(data, filePath) {

    let dataStr = JSON.stringify(data, null, 2);  // Convert data to a JSON string

    fs.writeFile(filePath, dataStr, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written successfully');
        }
    });
}

// Crea los objetos UPG a partir de un objeto JSON
function CreateUPGObjects(JSONData, ThisFilePath) {

    let UPGNumber = 104000;

    initializeFile(ThisFilePath);

    JSONData.forEach(element => {

        // Lista los nombres de las claves del objeto JSON que representa una tabla
        let JSONObjectKeys = Object.keys(element);
        // El valor 0 son el tag OBJECT Table, el id y el nombre de la tabla
        let ThisTable = element[JSONObjectKeys[0]];
        let ThisTableHeader = JSONObjectKeys[0];
        let ThisTableID = getNumberAndName(ThisTableHeader);
        let ThisTableName = ThisTableID['number'] + '_' + removeDisallowedCharacters(ThisTableID['name']).replace(/ /g, '_');

        console.log('Created: '+ ThisTableName);

        // Obtiene los campos que son necesarios para la UPG
        let TableKeys = ThisTable["KEYS"];
        let ClusteredKey = FindClusteredKey(TableKeys);
        let KeyFields = ClusteredKey["includedFields"];
        let ObjectKeyFields = ThisTable["FIELDS"].filter(element => KeyFields.includes(element.name));
        let AllNonKeyFields = ThisTable["FIELDS"].filter(element => !KeyFields.includes(element.name));
        let ObjectExtensionFields = ThisTable["FIELDS"].filter(element => element.number >= 50000 && element.number < 100000);
        let KeyFieldsNames = ObjectKeyFields.map(element => element.name);
        let ConcatenatedKeyValues = KeyFieldsNames.join(',');

        let ObjectProperties = ThisTable["OBJECT-PROPERTIES"];
        let ObjectPropertiesKeys = Object.keys(ObjectProperties);

        addLineToFile(ThisFilePath, `OBJECT Table ${UPGNumber} ${ThisTableID['number']}_UPG`);
        addLineToFile(ThisFilePath, '{');

        addLineToFile(ThisFilePath, 'OBJECT-PROPERTIES');
        addLineToFile(ThisFilePath, '{');
        ObjectPropertiesKeys.forEach(element => {
            addLineToFile(ThisFilePath, `${element} = ${ObjectProperties[element]}`);
        });
        addLineToFile(ThisFilePath, '}');

        addLineToFile(ThisFilePath, 'FIELDS');
        addLineToFile(ThisFilePath, '{');
        ObjectKeyFields.forEach(element => {
            addLineToFile(ThisFilePath, `{ ${element.number}; ; ${element.name}; ${element.type}; ${element.other}}`);
        });
        if (ThisTableID['number'] >= 50000 && ThisTableID['number'] < 100000) {
            // Si se trata de una tabla personalizada, se añaden todos los campos
            AllNonKeyFields.forEach(element => {
                addLineToFile(ThisFilePath, `{ ${element.number}; ; ${element.name}; ${element.type}; ${element.other}}`);
            });
        } else {
            // Si se trata de una tabla estándar, se añaden los campos de extensión
            ObjectExtensionFields.forEach(element => {
                addLineToFile(ThisFilePath, `{ ${element.number}; ; ${element.name}; ${element.type}; ${element.other}}`);
            });
        }
        addLineToFile(ThisFilePath, '}');

        addLineToFile(ThisFilePath, 'KEYS');
        addLineToFile(ThisFilePath, '{');
        addLineToFile(ThisFilePath, `{  ; ${ConcatenatedKeyValues}; Clustered=Yes }`);
        addLineToFile(ThisFilePath, '}');

        addLineToFile(ThisFilePath, 'FIELDGROUPS');
        addLineToFile(ThisFilePath, '{');
        addLineToFile(ThisFilePath, '}');

        addLineToFile(ThisFilePath, 'CODE');
        addLineToFile(ThisFilePath, '{');
        addLineToFile(ThisFilePath, 'Begin');
        addLineToFile(ThisFilePath, 'End.');
        addLineToFile(ThisFilePath, '}');

        addLineToFile(ThisFilePath, '}');

        addLineToFile(ThisFilePath, '');

        UPGNumber++;
    });
}

// Encuentra la clave primaria
function FindClusteredKey(TableKeys) {
    let ClusteredKey = TableKeys.find(element => element.clustered == true);
    return ClusteredKey;
}

// Extrae de la cabecera del objeto tabla el número y el nombre
function getNumberAndName(str) {
    const regex = /OBJECT Table (\d+) (.+)/;
    const match = str.match(regex);

    if (match) {
        return {
            number: match[1],
            name: match[2]
        };
    } else {
        return null;
    }
}

// Procesa el archivo seleccionado
function processFile(answer) {
    console.log(`File Selected: ${answer}`);

    fs.readFile(answer, 'utf-8', function(err, contents) {
        if (err) {
            console.log('Error: ', err);
            return;
        }
        const result = copyToObject(contents);

        rl.question('Select an output folder: ', (ThisFilePath) => {

            // Check if ThisFilePath is a directory
            try {
                if (!fs.statSync(ThisFilePath).isDirectory()) {
                    console.log('Error: The specified path is not a directory.');
                    return;
                }
            } catch (err) {
                console.log('Error checking if path is a directory:', err);
                return;
            }
    
            rl.question('Please select an option (1-2):\n1. Save references as JSON\n2. Create UPG tables\n', (answer) => {
                switch(answer) {
                    case '1':
                        console.log('You selected 1.');
                            ThisFilePath = `${ThisFilePath}\\JSONTables.json`;
                            WriteJSONDataToFile(result, ThisFilePath);
                        break;
                    case '2':
                        console.log('You selected 2.');
                            ThisFilePath = `${ThisFilePath}\\UPGTables.txt`;
                            CreateUPGObjects(result, ThisFilePath);
                        break;
                    default:
                        console.log('Invalid selection.');
                }
                rl.close();
            });

        });



    });

}

// Main

rl.question('Please select a file to read: ', processFile);
