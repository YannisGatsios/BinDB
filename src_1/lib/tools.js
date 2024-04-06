import fs from 'fs';
import { readData } from './fileIO.js';

export var cTools = {
    getName(conf){
        return conf.split(':')[0];
    },
    getSize(conf){
        return parseInt(conf.split(':')[1]);
    },
    getType(conf){
        return conf.split(':')[2];
    },
    getNameList(conf){
        let result = [];
        for(let i = 0;i<conf.length;i++){
            result[i] = this.getName(conf[i]);
        }
        return result;
    },
    autoIncrease(conf){
        return conf = this.getName(conf)+":"+(this.getSize(conf)+1).toString()+":au";
    },
    areValidTypes(array,conf, columnIindex){
        for(let i = 0;i < array.length;i++){
            if(this.getType(conf[columnIindex[i]]) !== typeof(array[i]) && !(this.getType(conf[columnIindex[i]]) === "buffer" && Buffer.isBuffer(array[i])) && !(this.getType(conf[columnIindex[i]]) === "au" && typeof(array[i]) === "number")){
                return false;
            }
        }
        return true;
    }
}

export function lastItem(Array){
    return Array[Array.length-1]
}

export function lastIndex(tablePath){
    let index = '';
    let data = '';
    for(let i = fs.statSync(tablePath).size; i > 0;i--){
        if(data.includes(',')){
            return index;
        }
        index = data;
        data = readData(tablePath,i-1).toString();
    }
}

export function remove(array, value){
    var index = array.indexOf(value);
    if(index > -1){
        array.splice(index, 1);
    }
    return array;
}

export function sliceArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

export function removeDiff(array, value){
    let result = [];
    for(let i = 0; i < array.length;i++){
        result[i] = (parseInt(array[i])-value).toString();
    }
    return result;
}

export function getColumnsIndex(tableConfig, columnsArray){
    let Array = [];
    let index = 0;
    for(let i = 0;i < tableConfig.length;i++){
        if(cTools.getName(tableConfig[i]) == columnsArray[index]){
            Array = [...Array,i];
            index++;
        }
    }
    return Array;
}

export function newIndexes(bufferArray, indexList){
    let lastIndex = parseInt(lastItem(indexList));
    let newIndexes = [];
    for(let i = 0;i < bufferArray.length;i++){
        newIndexes[i] = ((lastIndex+bufferArray[i].length).toString())
        lastIndex = parseInt(newIndexes[i])
    }
    return newIndexes;
}

export function arrayToBuffer(array, conf){
    let buf = []
    let index = 0;
    for(let i = 0; i < conf.length;i++){
        if(typeof(array[index]) === cTools.getType(conf[i])){
            buf[i] = Buffer.from(array[index].toString());
        }else if(cTools.getType(conf[i]) === "buffer" && Buffer.isBuffer(array[index])){
            buf[i] = array[index];
        }else if(cTools.getType(conf[i]) === "au"){
            buf[i] = Buffer.from((array[index]).toString());
        }else{return "arrayToBuffer(): Invalid data type.";}
        index++;
        if(buf[i].length > cTools.getSize(conf[i])) return "Surpased maximum buffer size";
    }
    return buf;
}

export function jsonResult(array,column){
    var result = new Object();
    for(let i = 0;i < array.length;i++){
        var json = new Object();
        for(let j = 0;j < column.length;j++){
            json[column[j]] = array[i][j]
        }
        result[i] = json;
    }
    return result;
}

export function BuffToArray(buffArray,tableConf){
    let result = [];
    for(let i = 0;i < tableConf.length;i++){    
        if(cTools.getType(tableConf[i]) === "string"){
            result[i] = buffArray[i].toString();
        }else if(cTools.getType(tableConf[i]) === "number"){
            result[i] = parseInt(buffArray[i].toString());
        }else if(cTools.getType(tableConf[i]) === "au"){
            result[i] = parseInt(buffArray[i].toString());
        }else if(cTools.getType(tableConf[i]) === "buffer"){
            result[i] = buffArray[i];
        }else{return ["Error"];}
    }
    return result;
}

export function readRow(tablePath, indexListIndex, indexList, conf){
    let result = [];
    for(let i = 0;i < conf.length;i++){
        result[i] = readData(tablePath, indexList[indexListIndex+i], indexList[indexListIndex+i+1])
    }
    return result;
}

export function shortenFile(path, endIndex){
    const startSize = Math.max(0, endIndex);
    fs.truncateSync(path,startSize);
}
