import fs from 'fs';
import { bindbconfig } from '../config.js';

const conf = new bindbconfig();
const NEXT_ELEMENT = conf.NEXT_ELEMENT
const NEXT_ROW = conf.NEXT_ROW;

export function readElement(path, indexStart = 0, option = NEXT_ELEMENT){
    var data = fs.readFileSync(path);
    var buf = new Buffer.alloc(data.length-indexStart);
    data.copy(buf,0,indexStart,data.length);

    var bufToSend = new Buffer.alloc(endOfFirstVariable(buf, option));
    buf.copy(bufToSend,0,0,buf.length);

    return new Uint8Array(bufToSend);
}

export function readRow(path, indexStart = 0){
    const uint8Array = readElement(path, indexStart, NEXT_ROW);
    var array = [];
    let index = 0;
    let tempStr = '';
    for (var i = 0; i < uint8Array.byteLength; i++) {
        if (uint8Array[i] == NEXT_ELEMENT || uint8Array[i] == NEXT_ROW){
            array[index] = tempStr;
            tempStr = '';
            index++;
        }else{
            tempStr = tempStr+new TextDecoder().decode(uint8Array)[i];
        }
    }
    
    indexStart = indexStart+uint8Array.length;
    return [array,indexStart];
}

export function appendData(path, data){
    fs.appendFileSync(path, data, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('Binary data saved to ', path);
        }
    });
}

function endOfFirstVariable(data, option) {
    const endIndex = data.indexOf(option);
    if (endIndex === 0) {
      return data.length;
    }
    return endIndex;
}

export function refuctorData(data){
    let asciiValues = data.join('').split('').map(char => char.charCodeAt(0));
    let uint8Array = new Uint8Array(asciiValues.length + data.length - 1);
    let currentIndex = 0;

    data.forEach((str, index) => {
        let strAsciiValues = str.split('').map(char => char.charCodeAt(0));
        uint8Array.set(strAsciiValues, currentIndex);
        currentIndex += strAsciiValues.length;
        if (index < data.length - 1) {
            uint8Array[currentIndex] = NEXT_ELEMENT;
            currentIndex++;
        }
    });
    return new  Uint8Array([...uint8Array, NEXT_ELEMENT, NEXT_ROW]);
}

export function updateElement(DBpath, newData, index, tableName, indexOfRow = 0){
    let path = DBpath + "/" + tableName + ".bin";
    let data = readRow(path, indexOfRow)[0];
    data[index] = newData;
    console.log(data);
    var newData = refuctorData(data);
    return newData;
}

export function shortenFile(path, endIndex){
    const startSize = Math.max(0, endIndex);
    fs.truncateSync(path,startSize);
}

export function getElementIndex(tableConfig, elementName){
    var elementIndex = 0;
    var i=0;
    tableConfig.forEach(element => {
        if(element == elementName){
            elementIndex = i;
        }
        i++;
    });
    return elementIndex;
}