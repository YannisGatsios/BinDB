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

export function arrayToBuffer(array){
        let newData = Buffer.alloc(0);
        for(let i = 0;i < array.length;i++){
            if(Buffer.isBuffer(array[i])){
                newData = Buffer.concat([newData, Buffer.from((array[i].length-1).toString(),'utf8'),Buffer.from(NEXT_ELEMENT.toString(16), 'hex'), array[i]])
            }else{
                newData = Buffer.concat([newData,Buffer.from(array[i],'utf8'),Buffer.from(NEXT_ELEMENT.toString(16), 'hex')])
            }
        }
        newData = Buffer.concat([newData,Buffer.from(NEXT_ROW.toString(16), 'hex')])
        return newData
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