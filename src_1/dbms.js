import { appendIndex, getIndexes, getTableConf } from "./indexing.js";
import { appendData, readData } from "./lib/fileIO.js";
import { BuffToArray, getColumnsIndex, insertionProcess, shortenFile, confNames } from "./lib/tools.js";
//id:0:au,name:10:string,age:10:number,image:10:buffer;0
var database = 'testDB';
var BDpath = '../Databases/';
var buf = Buffer.from("hellohell]");

export class dbms{
    insert(tableName,dataArray){
        let tablePath = BDpath+database+"."+tableName+".bdb";
        let conf = getTableConf(tablePath);
        let indexes = getIndexes(tablePath);
        if(dataArray.length !== conf.length && conf.join('').split(':').includes('au')){return "invalid array length";}

        let [buf, newIndexes] = insertionProcess(conf, indexes, dataArray);
        if(!Buffer.isBuffer(buf)){return buf;}
        
        shortenFile(tablePath, indexes[indexes.length-1]);
        appendData(tablePath, buf);
        indexes = [...indexes,...newIndexes];
        appendIndex(tablePath, conf, indexes);
    }
    
    find(tableName, resultColumns = 0, columnsToSearch = 0, valueOfColumn = columnsToSearch){
        let tablePath = BDpath+database+"."+tableName+".bdb";
        let [conf,indexes] = [getTableConf(tablePath), getIndexes(tablePath)];
        if(resultColumns === 0){resultColumns = confNames(conf)}
        let [columnIndArray,resultIndArray] = [getColumnsIndex(conf, columnsToSearch), getColumnsIndex(conf, resultColumns)];
        
        let [resultArray, row, maching] = [ [], [], false ];
        for(let i = 0;i < indexes.length-1;i++){
            let columnIindex = i%conf.length;
            let data = readData(tablePath,parseInt(indexes[i]),parseInt(indexes[i+1]));
            row[columnIindex] = data;
            if(columnIindex === conf.length-1){
                row = BuffToArray(row, conf);
                for(let j = 0;j < columnIndArray.length;j++){
                    if(columnsToSearch !== 0 && row[columnIndArray[j]] === valueOfColumn[j] || columnsToSearch === 0){
                        maching = true;
                    }else{maching = false}
                }
                if(columnsToSearch === 0){maching = true;}
            }
            if(maching){
                if(resultColumns === "index"){
                    resultArray = [...resultArray,parseInt(indexes[i-(conf.length-1)])];
                }else if(resultColumns.length >= 1 && typeof(resultColumns[0]) === "string"){
                    let tmpRow = [];
                    for(let j = 0;j < resultIndArray.length; j++){
                        tmpRow[j] = row[resultIndArray[j]];
                    }
                    resultArray = [...resultArray, tmpRow];
                }
                maching = false;
            }
        }
        return resultArray;
    }
}
let db = new dbms();
//db.insert("Products",['[ellohello',1000000000 ,buf]);
//db.insert("Products",['[ellohello',505 ,buf]);
console.log(db.find("Products"));