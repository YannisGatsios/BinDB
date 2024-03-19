import fs from 'fs';
import { readRow,refuctorData,shortenFile,appendData } from "./DBio.js";
import { bindbconfig } from '../config.js';

const conf = new bindbconfig();
const NEXT_ROW = conf.NEXT_ROW;

export function tableIndexList(databasePath, tableName){
    let indexFilesPath = databasePath +"/tablesIndex/"+ tableName + "_index.bin";
    var conf = readRow(indexFilesPath)[0];
    //console.log(conf);
    let indexData = readRow(indexFilesPath,refuctorData(conf).length-1);
    conf[conf.length] = conf.length;
    var indexList = indexData[0];
    indexList[0] = tableName;
    //console.log(indexList);
    return [indexList, conf];
}

export function insertIndex(databasePath, tableName, data, indexList){
    let indexFilesPath = databasePath +"/tablesIndex/"+ tableName + "_index.bin";
    let index = [(data.length + parseInt(indexList)).toString()];
    let newdata = refuctorData(index).slice(0,-1);
    console.log(newdata);
    appendData(indexFilesPath, newdata);
}


//OLLDDD
export function updateIndexFile(databasePath, tableName, updatedIndexList){
    let indexFilesPath = databasePath +"/tablesIndex/"+ tableName + "_index.bin";
    var conf = readRow(indexFilesPath)[0];
    var tempData = refuctorData(updatedIndexList.slice(1));
    var rawData = new Uint8Array(tempData.length-1);
    for(let i = 0; i<tempData.length-1;i++){
        if(tempData != NEXT_ROW){
            rawData[i]=tempData[i];
        }
    }
    console.log(rawData+"ihello=========");
    fs.writeSync(fs.openSync(indexFilesPath, "r+") , new Buffer.from(rawData), 0, rawData.length, refuctorData(conf).length);
    shortenFile(indexFilesPath,refuctorData(conf).length+rawData.length);
}

//NEWWW
export function updateIndex(DBpath, tableName){
    const tablePath = DBpath + "/"+ tableName + ".bin";
    var indexArray = ["0"];
    let y = 0;
    let i = 0;
    while(i==0){
        try{
            indexArray[y+1] = (readRow(tablePath,parseInt(indexArray[y]))[1]+1).toString();
        }catch{
            i++;
        }
        y++;
    }
    
    const indexFilesPath = DBpath +"/tablesIndex/"+ tableName + "_index.bin";
    var conf = refuctorData(readRow(indexFilesPath)[0]).length;
    shortenFile(indexFilesPath,conf);
    console.log(indexArray);
    appendData(indexFilesPath, refuctorData(indexArray).slice(0,-1));
}

//console.log(update(DefaultDBpath+"/BIN_DATABASE","Users"));


//axristo gia tin ora
export function getElementIndex(DBpath, tebleName, elementName){
    const [indexList,tableConfig] = tableIndexList(DBpath, tebleName);
    let elementIndex = 0;
    tableConfig.forEach(element => {
        if(tableConfig[elementIndex] != elementName){
            elementIndex++;
        }
    });
    return elementIndex,indexList;
}