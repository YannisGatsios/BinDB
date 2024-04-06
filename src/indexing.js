import fs from 'fs';
import { appendData, readData } from "./lib/fileIO.js";
import { lastIndex, shortenFile, removeDiff } from './lib/tools.js';

function getConfPart(tablePath){
    if(readData(tablePath,fs.statSync(tablePath).size-2).toString() === ';0'){
        return readData(tablePath,0).toString().split(';');
    }
    let table = readData(tablePath,lastIndex(tablePath)).toString();
    return table.split(';');
}

export function getTableConf(tablePath){
    return getConfPart(tablePath)[0].split(',');
}

export function getIndexes(tablePath){
    return getConfPart(tablePath)[1].split(',');
}

export function appendIndex(tablePath, conf, newIndexes){
    conf = conf.join(',');
    newIndexes = newIndexes.join(',');
    appendData(tablePath,[conf,newIndexes].join(';'));
}

export function deleteIndex(tablePath, indexes, conf, index){
    let diff = parseInt(indexes[index+conf.length]) - parseInt(indexes[index]);
    let result = [...indexes.slice(0,index), ...removeDiff(indexes.slice(index+conf.length), diff)];
    conf = [conf.join(','),result.join(',')].join(';')

    shortenFile(tablePath,result[result.length-1])
    appendData(tablePath, conf)
    return result;
}