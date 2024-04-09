import fs from 'fs'
import { appendIndex, deleteIndex, getIndexes, getTableConf } from "./indexing.js";
import { appendData, deleteData, readData } from "./lib/fileIO.js";
import { BuffToArray, getColumnsIndex, shortenFile, cTools, arrayToBuffer, newIndexes, readRow, jsonResult } from "./lib/tools.js";
//id:0:au,name:10:string,age:10:number,image:10:buffer;0

var buf = Buffer.from("hellohell]");

export class dbms{
    tablesConfPath = "./.tables.conf";
    BDpath = '../Databases/';
    database = "";
    selectDB(database){
        let tablesConf = readData(this.tablesConfPath,0).toString().split(";");
        if(!tablesConf[0].slice(",").includes(database)) return "Invalid database.";
        this.database = database;
        return this.database+" selected.";
    }
    unselectDB(){
        this.DBpath = "";
    }
    newTable(tableName,tableConf,customPath  = 0){
        if(this.database === "") return "no database selected";
        let tablesConf = readData(this.tablesConfPath,0).toString().split(";");
        let path = this.BDpath;
        if(tablesConf[1].split(',').includes(this.database)) path += this.database+"/";
        if(customPath !== 0) {
            path = customPath + this.database+"."+tableName+".bdb";
            if(fs.existsSync(path)) return "File already exists.";
            if(!tablesConf[1].split(",").includes(this.database)) tablesConf[1] += ","+this.database;
            tablesConf[2] += ","+this.database+"."+tableName+">"+customPath;
            shortenFile(this.tablesConfPath,0);
            appendData(path,tableConf+";0");
            appendData(this.tablesConfPath,tablesConf.join(";"));
            return path;
        }
        path += this.database+"."+tableName+".bdb";
        if(fs.existsSync(path)) return "File already exists."
        appendData(path,tableConf+";0");
        return path;
    }
    newDatabase(database){
        let tablesConf = readData(this.tablesConfPath,0).toString().split(";");
        let databases = tablesConf[0];
        if(databases.includes(database)) return "Database already exists.";
        tablesConf[0] = [...databases.split(","),database].join(",");
        shortenFile(this.tablesConfPath,0)
        appendData(this.tablesConfPath, tablesConf.join(";"))
        return database+" created.";
    }

    insert(tableName,dataArray){
        if(this.database === "") return "no database selected";
        let tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        let [conf,indexes] = [getTableConf(tablePath), getIndexes(tablePath)];
        if(dataArray.length > conf.length){return "invalid array length";}

        let newArray = [];
        let index = 0;
        let diff = conf.length-dataArray.length;
        for(let i = 0;i < conf.length;i++){
            if(cTools.getType(conf[i]) === "au" && diff !== 0){
                newArray[i] = cTools.getSize(conf[i]);
                conf[i] = cTools.autoIncrease(conf[i]);
            }else{
                newArray[i] = dataArray[index];
                index++
            }
        }
        let buf = arrayToBuffer(newArray, conf);
        let newIndexList = newIndexes(buf, indexes);
        if(buf === "Surpased maximum buffer size") return buf;
        
        shortenFile(tablePath, indexes[indexes.length-1]);
        appendData(tablePath, buf.join(''));
        indexes = [...indexes,...newIndexList];
        appendIndex(tablePath, conf, indexes);
        return "Inserted";
    }
    
    find(tableName, resultColumns = 0, columnsToSearch = 0, valueOfColumn = columnsToSearch){
        if(this.database === "") return "no database selected";
        let tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        let [conf,indexes] = [getTableConf(tablePath), getIndexes(tablePath)];
        if(resultColumns === 0) resultColumns = cTools.getNameList(conf);
        let [columnIndArray,resultIndArray] = [getColumnsIndex(conf, columnsToSearch), getColumnsIndex(conf, resultColumns)];
        if(resultIndArray.length === 0 && resultColumns !== "index") return "Invalid reuslt argument";
        if(columnIndArray.length === 0 && columnsToSearch !== 0) return "Invalid search argument";
        
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
                if(columnsToSearch === 0) maching = true;
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
        return [resultColumns,resultArray];
    }

    deleteRow(tableName,index){
        if(this.database === "") return "no database selected";
        let tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        let [conf,indexList] = [getTableConf(tablePath), getIndexes(tablePath)];
        if(!indexList.includes(index.toString())) return "invalid Index.";

        let indexListIndex = indexList.indexOf(index.toString());

        deleteData(tablePath, indexList[indexListIndex], indexList[indexListIndex+conf.length])
        deleteIndex(tablePath, indexList, conf, indexListIndex);

        return "deleted row with index of: "+index;
    }

    delete(tableName,columnsToSearch = 0, valueOfColumn = columnsToSearch){
        if(this.database === "") return "no database selected";
        let tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        let [conf,indexList] = [getTableConf(tablePath), getIndexes(tablePath)];
        
        let result = this.find(tableName, "index" , columnsToSearch, valueOfColumn)[1];
        if(result.length < 1) return "Nothing found to delete.";
        let index = indexList.indexOf(result[result.length-1].toString());
        for(let i = result.length-1;i >= 0;i--){
            this.deleteRow(tableName,parseInt(indexList[index]));
            index = indexList.indexOf(result[i].toString());
            indexList = deleteIndex(tablePath, indexList, conf, index);
        }
        return result.length+" rows deleted."
    }

    updateRow(tableName, columnsToUpdate, newValues, index){
        if(this.database === "") return "no database selected";
        let tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        let [conf,indexList] = [getTableConf(tablePath), getIndexes(tablePath)];
        if(!indexList.includes(index.toString())) return "invalid Index.";
        if(columnsToUpdate.length > conf.length || newValues.length !== columnsToUpdate.length) return "Inalid arguments.";
        let comlumnIndex = getColumnsIndex(conf, columnsToUpdate);
        if(!cTools.areValidTypes(newValues, conf, comlumnIndex)) return "Invalid Types.";

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
        if(this.database === "") return "no database selected";
        let result = this.find(tableName, "index" , columnsToSearch, whereValues)[1];
        if(result.length < 1) return "Nothing found to delete.";
        for(let i = result.length-1;i >= 0;i--){
            this.updateRow(tableName,columnsToUpdate,newValues,result[i]);
        }
        return result.length+" rows updated."
    }
}

function path(tableName, DBpath, database, tableConf){
    let tablePaths = (readData(tableConf,0)).toString();
    tablePaths = tablePaths.split(';');
    if(tablePaths[0].split(',').includes(database)){
        if(tablePaths[1].split(',').includes(database)){
            if(tablePaths[2].split(/[,>]+/).includes(database+"."+tableName)){
                let index = tablePaths[2].split(/[,>]+/).indexOf(database+"."+tableName)
                return tablePaths[2].split(/[,>]+/)[index+1];
            }else{
                return DBpath+database+"/";
            }
        }
        return DBpath;
    }
    return "Invalid database.";
}

/*
let db = new dbms();
db.BDpath = '../Databases/';
db.tablesConf = './.tables.conf';
console.log(db.selectDB("BinDB"))
//console.log(db.newTable("users","id:0:au,name:25:string","C:\\Users\\gatsi\\OneDrive\\Υπολογιστής\\"))
//console.log(db.insert("users",['root',"0","admin","$2b$10$xEyC6QW5X0HN3ETcfYpwnuEkGyjhZek1bxnGi6yJNcEH4ECYhK8He"]));
//db.insert("Products",['[ellohello',505 ,buf]);
//console.log(db.delete("Products",['id'],[2]));
//console.log(db.deleteRow("products",31))
//console.log(db.updateRow("Products",['name','age'],['john', 999],86));
//console.log(db.update("users",['username'],["root"],['rights'],["admin"]))
let col = ["rights"]
var result = db.find("users", col);
console.log(result);
var conf = ["username","token","rights","password"];
var json = jsonResult(result,col)
console.log(json[0].rights)*/
