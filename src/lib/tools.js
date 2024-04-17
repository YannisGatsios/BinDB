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

}
export function areValidTypes(update, conf, columnIindex){
    for(let i = 0;i < Object.keys(update).length;i++){
            if(conf[Object.keys(update)[i]].type === typeof(update[Object.keys(update)[i]]) || (conf[Object.keys(update)[i]].type === "buffer" && Buffer.isBuffer(update[Object.keys(update)[i]])) || (conf[Object.keys(update)[i]].type === "au" && typeof(update[Object.keys(update)[i]]) === "number")){
                return true
            }
    }
    return false;
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

export function getColumnsIndex(conf, columnsArray){
    let Array = [];
    let index = 0;
    for(let i = 0;i < conf.len;i++){
        if(Object.keys(conf)[i] === columnsArray[index]){
            Array = [...Array,i];
            index++;
        }
    }
    return Array;
}

export function newIndex(array, indexList){
    let result = [indexList[indexList.length-1][0]];
    for(let i = 1;i < array.length;i++){
        result[i] = result[i-1]+array[i-1].length;
    }
    indexList[indexList.length-1] = result;
    indexList[indexList.length] = [result[result.length-1]+array[array.length-1].length]
    return indexList;
}

export function arrayToBuffer(array, conf){
    let buf = []
    let index = 0;
    for(let i = 0; i < conf.len;i++){
        if(typeof(array[index]) === conf[conf.names[i]].type){
            buf[i] = Buffer.from(array[index].toString());
        }else if(conf[conf.names[i]].type === "buffer" && Buffer.isBuffer(array[index])){
            buf[i] = array[index];
        }else if(conf[conf.names[i]].type === "au"){
            buf[i] = Buffer.from((array[index]).toString());
        }else{return "arrayToBuffer(): Invalid data type.";}
        index++;
        if(buf[i].length > conf[conf.names[i]].size) return "Surpased maximum buffer size";
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

export function jsonToArray(json) {
    let objetsContents = Object.keys(json);
    let result = [];
    for (let i = 0; i < objetsContents.length; i++) {
        if (typeof json[objetsContents[i]] === 'number' || typeof json[objetsContents[i]] === 'string') {
            result.push(json[objetsContents[i]]);
        } else if (typeof json[objetsContents[i]] === 'object' && json[objetsContents[i]] !== null) {
            if (json[objetsContents[i]].type === 'Buffer' && Array.isArray(json[objetsContents[i]].data)) {
                result.push(Buffer.from(json[objetsContents[i]].data));
            } else {
                return "Invalid data type in object.";
            }
        } else {
            return "Invalid data type.";
        }
    }
    return result;
}

export function BuffToArray(array, conf){
    let result = [];
    for(let i = 0;i < conf.len;i++){    
        if(conf[Object.keys(conf)[i]].type === "string"){
            result.push(array[i].toString());
        }else if(conf[Object.keys(conf)[i]].type === "number"){
            result.push(parseInt(array[i].toString()));
        }else if(conf[Object.keys(conf)[i]].type === "au"){
            result.push(parseInt(array[i].toString()));
        }else if(conf[Object.keys(conf)[i]].type === "buffer"){
            result.push(array[i]);
        }else{return ["Error"];}
    }
    return result;
}

export function readRow(tablePath, rowindex, indexList){
    let result = [];
    for(let i = 0;i < indexList[rowindex].length-1;i++){
        result.push(readData(tablePath, indexList[rowindex][i], indexList[rowindex][i+1]))
    }
    result.push(readData(tablePath, indexList[rowindex][indexList[0].length-1], indexList[rowindex+1][0]))
    return result;
}

export function shortenFile(path, endIndex){
    const startSize = Math.max(0, endIndex);
    fs.truncateSync(path,startSize);
}
