import { appendIndex, deleteIndex, getIndexes, getTableConf } from "./indexing.js";
import { appendData, deleteData, readData } from "./lib/fileIO.js";
import { BuffToArray, getColumnsIndex, shortenFile, cTools, arrayToBuffer, newIndexes, readRow } from "./lib/tools.js";
//id:0:au,name:10:string,age:10:number,image:10:buffer;0
var database = 'BinDB';
var BDpath = '../Databases/';
var buf = Buffer.from("hellohell]");

export class dbms{
    insert(tableName,dataArray){
        let tablePath = path(tableName, BDpath, database);
        let [conf,indexes] = [getTableConf(tablePath), getIndexes(tablePath)];
        if(dataArray.length !== conf.length && conf.join('').split(':').includes('au')){return "invalid array length";}

        let newArray = [];
        let index = 0;
        let diff = conf.length-dataArray.length;
        for(let i = 0;i < conf.length;i++){
            if(cTools.type(conf[i]) === "au" && diff !== 0){
                newArray[i] = cTools.bufSize(conf[i]);
                conf[i] = cTools.autoIncrease(conf[i]);
            }else{
                newArray[i] = dataArray[index];
                index++
            }
        }
        let buf = arrayToBuffer(newArray, conf);
        let newIndexList = newIndexes(buf, indexes);
        
        shortenFile(tablePath, indexes[indexes.length-1]);
        appendData(tablePath, buf.join(''));
        indexes = [...indexes,...newIndexList];
        appendIndex(tablePath, conf, indexes);
    }
    
    find(tableName, resultColumns = 0, columnsToSearch = 0, valueOfColumn = columnsToSearch){
        let tablePath = path(tableName, BDpath, database);
        let [conf,indexes] = [getTableConf(tablePath), getIndexes(tablePath)];
        if(resultColumns === 0){resultColumns = cTools.nameList(conf)}
        let [columnIndArray,resultIndArray] = [getColumnsIndex(conf, columnsToSearch), getColumnsIndex(conf, resultColumns)];
        
        let [resultArray, row, maching] = [ [], [], false ];
        for(let i = conf.length-1;i < indexes.length;i++){
            let columnIindex = i%(conf.length);
            if(columnIindex === conf.length-1){
                row  = readRow(tablePath,i-(conf.length-1),indexes,conf)
                row = BuffToArray(row, conf);
                for(let j = 0;j < columnIndArray.length;j++){
                    if(columnsToSearch !== 0 && row[columnIndArray[j]] === valueOfColumn[j] || columnsToSearch === 0){
                        maching = true;
                    }else{
                        maching = false;
                        j = columnIndArray.length;
                    }
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

    deleteRow(tableName,index){
        let tablePath = path(tableName, BDpath, database);
        let [conf,indexList] = [getTableConf(tablePath), getIndexes(tablePath)];
        if(!indexList.includes(index.toString())){return "invalid Index."}

        let indexListIndex = indexList.indexOf(index.toString());

        deleteData(tablePath, indexList[indexListIndex], indexList[indexListIndex+conf.length])
        deleteIndex(tablePath, indexList, conf, indexListIndex);

        return "deleted row with index of: "+index;
    }

    delete(tableName,columnsToSearch = 0, valueOfColumn = columnsToSearch){
        let tablePath = path(tableName, BDpath, database);
        let [conf,indexList] = [getTableConf(tablePath), getIndexes(tablePath)];
        
        let result = this.find(tableName, "index" , columnsToSearch, valueOfColumn);
        if(result.length < 1){return "Nothing found to delete.";}
        let index = indexList.indexOf(result[result.length-1].toString());
        for(let i = result.length-1;i >= 0;i--){
            this.deleteRow(tableName,parseInt(indexList[index]));
            index = indexList.indexOf(result[i].toString());
            indexList = deleteIndex(tablePath, indexList, conf, index);
        }
        return result.length+" rows deleted."
    }

    updateRow(tableName, columnsToUpdate, newValues, index){
        let tablePath = path(tableName, BDpath, database);
        let [conf,indexList] = [getTableConf(tablePath), getIndexes(tablePath)];
        if(!indexList.includes(index.toString())){return "invalid Index."}
        if(columnsToUpdate.length > conf.length || newValues.length !== columnsToUpdate.length){return "Inalid arguments."}
        let comlumnIndex = getColumnsIndex(conf, columnsToUpdate);
        if(!cTools.areValidTypes(newValues, conf, comlumnIndex)){return "Invalid Types."}

        let indexListIndex = indexList.indexOf(index.toString());
        let row = readRow(tablePath, indexListIndex, indexList, conf);
        row = BuffToArray(row, conf);
        for(let i = 0;i <= comlumnIndex.length-1;i++){
            row[comlumnIndex[i]] = newValues[i];
        }

        this.deleteRow(tableName,index);
        this.insert(tableName, row);
        return "Updated row with index of: "+index;
    }

    update(tableName, columnsToSearch, whereValues, columnsToUpdate,newValues){
        let result = this.find(tableName, "index" , columnsToSearch, whereValues);
        if(result.length < 1){return "Nothing found to delete.";}
        for(let i = result.length-1;i >= 0;i--){
            this.updateRow(tableName,columnsToUpdate,newValues,result[i]);
        }
        return result.length+" rows updated."
    }
}

function path(tableName, DBpath, database){
    let tablePaths = (readData(DBpath+".tables.conf",0)).toString();
    tablePaths = tablePaths.split(';');
    if(tablePaths[0].split(',').includes(database)){
        if(tablePaths[2].split(/[,:]+/).includes(database+"."+tableName) || tablePaths[1].split(',').includes(database)){
            if(tablePaths[1].split(',').includes(database)){
                return DBpath+database+"/"+database+"."+tableName+".bdb";
            }else{
                return tablePaths[2].split(',').split(':')[1];
            }
        }
        return DBpath+database+"."+tableName+".bdb";
    }
    return "Invalid database."
}


let db = new dbms();
//db.insert("Products",['[ellohello',1000000000 ,buf]);
//db.insert("Products",['[ellohello',505 ,buf]);
console.log(db.find("Users"))
//console.log(db.delete("Products",['id'],[2]));
//console.log(db.deleteRow("products",31))
//console.log(db.updateRow("Products",['name','age'],['john', 999],86));
//console.log(db.update("Products",['age'],[505],['name'],['john']))