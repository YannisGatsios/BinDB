import fs from 'fs';
import {bindbconfig} from '../config.js';

var conf = new bindbconfig();
const NEXT_ELEMENT = conf.NEXT_ELEMENT;
const NEXT_ROW = conf.NEXT_ROW;


export function endOfFirstVariable(data) {
        const endIndex = data.indexOf(NEXT_ROW);
        if (endIndex === 0) {
          return data.length;
        }
        return endIndex+1;
    }

export function bufferDataToArray(BufferData){
        const uint8Array = BufferData;
        var array = [];
        let index = 0;
        let tempStr = '';
        for (var i = 0; i < uint8Array.byteLength; i++) {
            if (uint8Array[i] == NEXT_ELEMENT){
                array[index] = tempStr;
                tempStr = '';
                index++;
            }else{
                tempStr = tempStr+new TextDecoder().decode(uint8Array)[i];
            }
        }
        return array;
    }

export function arrayToBuffer(data){
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
        uint8Array = [...uint8Array, NEXT_ELEMENT, NEXT_ROW];
        return new Buffer.from(uint8Array);
    }
export function getColumnsIndex(tableConfig, columnsArray){
    let Array = [];
    let index = 0;
    for(let i = 0;i < tableConfig.length;i++){
        if(tableConfig[i] == columnsArray[index]){
            Array = [...Array,i];
            index++;
        }
    }
    return Array;
}

export function shortenFile(path, endIndex){
    const startSize = Math.max(0, endIndex);
    fs.truncateSync(path,startSize);
}

export function updateValuesOfArray(Array, columnsIndexArray, newValuesArray){
    for(let i = 0; i < Array.length;i++){
        for(let j = 0; j<columnsIndexArray.length;j++){
            if(i == columnsIndexArray[j]){
                Array[i] = newValuesArray[j];
            }
        }
    }
    return Array;
}

export function requestData(data){
    let result = [];
    if(data.split(",").includes("255")){
        data.split(",255,").forEach((element) => {
            result = [...result, new TextDecoder().decode(new Uint8Array(element.split(",")))];
        })
    }else{
        result = new TextDecoder().decode(new Uint8Array(data.split(",")));
    }
    return result;
}