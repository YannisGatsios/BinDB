import fs from 'fs';
import { appendData, readData } from "./lib/fileIO.js";
import { lastIndex, shortenFile } from './lib/tools.js';


export function getTableConf(tablePath){
    const tableConfigPart = getConfPart(tablePath)[0].split(',')
    return jsonStructure(tableConfigPart);
}

export function getIndexList(tablePath){
    const tableConf = getTableConf(tablePath);
    const tableIndexlist = getConfPart(tablePath)[1].split(',')
    return indexListStructuire(tableIndexlist,tableConf);
}

export function appendIndex(tablePath, conf, newIndexList){
    appendData(tablePath,[stringifyConfig(conf),stringifyIndexList(newIndexList)].join(';'));
}

export function deleteIndex(tablePath, indexList, conf, index){
    let diff = indexList[index+1][0] - indexList[index][0];
    let result = [...indexList.slice(0,index), ...removeDiff(indexList.slice(index+1), diff)];
    conf = [stringifyConfig(conf),stringifyIndexList(result)].join(';')

    shortenFile(tablePath,result[result.length-1])
    appendData(tablePath, conf)
    return result;
}

function removeDiff(array, diff){
    let result = [];
    for(let i = 0; i < array.length;i++){
        let rowArray = [];
        for(let j = 0; j < array[i].length;j++){
            rowArray.push(array[i][j]-diff);
        }
        result.push(rowArray);
    }
    return result;
}

function getConfPart(tablePath){
    const fileSieze = fs.statSync(tablePath).size;
    if(readData(tablePath,fileSieze-2).toString() === ';0'){
        return readData(tablePath,0).toString().split(';');
    }
    let table = readData(tablePath,lastIndex(tablePath)).toString();
    return table.split(';');
}

function jsonStructure(conf){
    var result = new Object();
    for(let i = 0;i < conf.length;i++){
        result[conf[i].split(":")[0]] = {
            size: conf[i].split(":")[1],
            type: conf[i].split(":")[2]
        }
    }
    result["names"] = Object.keys(result);
    result["len"] = conf.length;
    return result;
}


function indexListStructuire(indexList, conf){
    let result = [];
    let rowArray = [];
    for(let i = 0; i < indexList.length;i++){
        rowArray.push(parseInt(indexList[i]))
        if(i%conf.len === conf.len-1){
            result.push(rowArray);
            rowArray = [];
        }
    }
    result.push([parseInt(indexList[indexList.length-1])]);
    return result
}

function stringifyConfig(conf){
    let result = [];
    const names = Object.keys(conf)
    for(let i = 0;i < conf.len;i++){
        result.push([names[i],conf[names[i]].size, conf[names[i]].type].join(":"))
    }
    return result.join(",");
}

function stringifyIndexList(indexList){
    let result = [];
    for(let i = 0;i < indexList.length;i++){
        result = [...result, ...indexList[i]]
    }
    return result.join(",");
}
/*
const conf = getTableConf("../Databases/testDB.Products.bdb");
var index = getIndexList("../Databases/testDB.Products.bdb");

console.log(index, conf,[stringifyConfig(conf), stringifyIndexList(index)].join(";"))*/