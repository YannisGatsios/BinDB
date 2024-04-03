import fs from 'fs';
import { appendData, readData } from "./lib/fileIO.js";
import { lastIndex } from './lib/tools.js';

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