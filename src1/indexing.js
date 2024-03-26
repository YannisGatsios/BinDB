import fs from 'fs';
import { bindbconfig } from "./config.js";
import { readRow,appendData } from "./lib/FileIO.js";
import { arrayToBuffer,bufferDataToArray,endOfFirstVariable,shortenFile } from "./lib/tools.js";
import { refuctorData } from '../src/lib/DBio.js';

var conf = new bindbconfig();


export function getTableConf(DBpath, tableName){
        let indexFilePath = DBpath+"/tablesindex/"+tableName+"_index.bin";
        
        let data = readRow(indexFilePath)[0];
        let tableConfig = bufferDataToArray(data);
        return tableConfig;
    }

export function getIndexes(DBpath, tableName){
        let indexFilePath = DBpath+"/tablesindex/"+tableName+"_index.bin";

        let conf = readRow(indexFilePath)[1];
        let indexData = readRow(indexFilePath,conf)[0];
        let indexList = bufferDataToArray(indexData);

        return indexList;
    }

export function appendIndexe(DBpath, tableName,newIndex){
        let indexFilePath = DBpath+"/tablesindex/"+tableName+"_index.bin";
        let fileSize = fs.statSync(indexFilePath).size;

        shortenFile(indexFilePath,fileSize-1);
        let data = Buffer.concat([new Buffer.from(newIndex.toString()),new Buffer.from(new Uint8Array([conf.NEXT_ELEMENT,conf.NEXT_ROW]))]);
        appendData(indexFilePath,data);
    }

export function deleteIndex(DBpath, tableName, indexToDelete){
        let indexFilePath = DBpath+"tablesindex/"+tableName+"_index.bin";
        
        let indexList = getIndexes(DBpath,tableName);
        let indexOf =indexList.indexOf(indexToDelete.toString());
        if(indexList.includes(indexToDelete.toString()) && (parseInt(indexList[indexOf]) !== 0 || indexList.length > 1)){

            let Array = [];
            for(let i = indexOf+1;i < indexList.length;i++){
                console.log(parseInt(indexList[i])-(parseInt(indexList[indexOf+1])-parseInt(indexToDelete)))
                Array = [...Array,(parseInt(indexList[i])-(parseInt(indexList[indexOf+1])-parseInt(indexToDelete))).toString()];
            }

            indexList = [...indexList.slice(0,indexOf),...Array];

            let indexStart = readRow(indexFilePath)[1];
            shortenFile(indexFilePath,indexStart);
            appendData(indexFilePath,arrayToBuffer(indexList))

            return "index deleted from index list";
        }else{
            return "not existing index OR index is 0 and the index list is empty";
        }
        
    }

export function syncIndexList(DBpath, tableName){
        let tablePath = DBpath+"/"+tableName+".bin";
        let indexFilePath = DBpath+"/tablesindex/"+tableName+"_index.bin";
        let fileSize = fs.statSync(tablePath).size;
        
        let Array = ['0'];
        let index = 0;
        while(index < fileSize){
            let nextIndex = readRow(tablePath,index)[1];
            Array = [...Array,nextIndex.toString()];
            index = nextIndex;
        }
        
        let indexStart = readRow( indexFilePath)[1];
        shortenFile( indexFilePath, indexStart);
        appendData( indexFilePath, arrayToBuffer(Array))

        return Array;
    }



/*
console.log(getTableConf(conf.DefaultDBpath+"testDB","Products"))
console.log(getIndexes(conf.DefaultDBpath+"testDB","Products"))
//console.log(ind.appendIndexe(conf.DefaultDBpath+"testDB","Products",90))
console.log(syncIndexList(conf.DefaultDBpath+"testDB","Products"))*/