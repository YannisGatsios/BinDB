import fs from 'fs';
import { readData } from './fileIO.js';

function name(conf){
    return conf.split(':')[0];
}
export function confNames(conf){
    let result = [];
    for(let i = 0;i<conf.length;i++){
        result[i] = name(conf[i]);
    }
    return result;
}
function maxSize(conf){
    return parseInt(conf.split(':')[1]);
}
function type(conf){
    return conf.split(':')[2];
}
function lastItem(Array){
    return Array[Array.length-1]
}

export function shortenFile(path, endIndex){
    const startSize = Math.max(0, endIndex);
    fs.truncateSync(path,startSize);
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

export function getColumnsIndex(tableConfig, columnsArray){
    let Array = [];
    let index = 0;
    for(let i = 0;i < tableConfig.length;i++){
        if(name(tableConfig[i]) == columnsArray[index]){
            Array = [...Array,i];
            index++;
        }
    }
    return Array;
}

export function insertionProcess(conf, indexes, dataArray){
    let newIndexes = [];
    let buf = Buffer.alloc(0);
    let index = 0;
    for(let i = 0; i < conf.length;i++){
        if(typeof(dataArray[index]) === type(conf[i])){
            buf = Buffer.concat([buf, Buffer.from(dataArray[index].toString())]);
            newIndexes[i] = (parseInt(lastItem(indexes))+buf.length).toString();
        }else if(type(conf[i]) === "buffer" && Buffer.isBuffer(dataArray[index])){
            buf = Buffer.concat([buf, dataArray[index]]);
            newIndexes[i] = (parseInt(lastItem(indexes))+buf.length).toString();
        }else if(type(conf[i]) === "au"){
            conf[i] = name(conf[i])+":"+(maxSize(conf[i])+1).toString()+":au";
            buf = Buffer.concat([buf, Buffer.from((maxSize(conf[i])).toString())]);
            newIndexes[i] = (parseInt(lastItem(indexes))+buf.length).toString();
            index--;
        }else{return "invalid data type";}
        index++;
        if(i+1 !== conf.length){if(parseInt(maxSize(conf[i])) < Buffer.from(dataArray[index].toString()).length && type(conf[i]) !== "au"){return "Surpased length"}}
    }
    return [buf,newIndexes];
}

export function BuffToArray(buffArray,tableConf){
    let result = [];
    for(let i = 0;i < tableConf.length;i++){    
        if(type(tableConf[i]) === "string"){
            result[i] = buffArray[i].toString();
        }else if(type(tableConf[i]) === "number"){
            result[i] = parseInt(buffArray[i].toString());
        }else if(type(tableConf[i]) === "au"){
            result[i] = parseInt(buffArray[i].toString());
        }else if(type(tableConf[i]) === "buffer"){
            result[i] = buffArray[i];
        }else{return ["Error"];}
    }
    return result;
}