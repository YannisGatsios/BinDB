import fs from 'fs'
import { appendIndex, deleteIndex, getIndexList, getTableConf } from "./indexing.js";
import { appendData, deleteData, readData } from "./lib/fileIO.js";
import { BuffToArray, getColumnsIndex, shortenFile, areValidTypes, arrayToBuffer, newIndex, readRow, jsonResult } from "./lib/tools.js";
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

    getConf(tableName){
        const tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        return getTableConf(tablePath);
    }

    insert(tableName,query){
        if(this.database === "") return "no database selected";
        const tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        let conf = getTableConf(tablePath);
        let indexList = getIndexList(tablePath);
        if(Object.keys(query.data).length > conf.len) return "invalid array length";

        const diff = conf.len-Object.keys(query.data).length;
        let newArray = [];
        let index = 0;
        for(let i = 0;i < conf.len;i++){
            if(conf[conf.names[i]].type === "au" && diff !== 0){
                newArray[i] = parseInt(conf[conf.names[i]].size);
                conf[conf.names[i]].size = (parseInt(conf[conf.names[i]].size)+1).toString();
            }else{
                newArray[i] = query.data[Object.keys(query.data)[index]];
                index++;
            }
        }
        const buf = arrayToBuffer(newArray, conf);
        indexList = newIndex(buf, indexList);
        if(buf === "Surpased maximum buffer size") return buf;
        shortenFile(tablePath, indexList[indexList.length-2][0]);
        appendData(tablePath, buf.join(''));
        appendIndex(tablePath, conf, indexList);
        return "Inserted";
    }
    
    find(tableName, query){
        if(this.database === "") return "No database selected.";
        let selected = query.select;
        const columns = Object.keys(query.where)
        const values = query.where
        const tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        const conf = getTableConf(tablePath);
        const indexList = getIndexList(tablePath);
        if(selected === 0) selected = conf.names;
        const [columnsIndex,resultIndex] = [getColumnsIndex(conf, columns), getColumnsIndex(conf, selected)];
        if(columnsIndex.length === 0 && columns !== 0) return "Invalid search argument.";
        if(resultIndex.length === 0 && selected !== "row") return "Invalid reuslt argument.";
        if(selected === "row") selected = ["row"]
        
        let [result, row, maching] = [ [], [], false ];
        for(let i = 0;i < indexList.length-1;i++){
            row  = readRow(tablePath,i,indexList)
            row = BuffToArray(row, conf);
            for(let j = 0;j < columnsIndex.length;j++){
                if(columns !== 0 && values[Object.keys(values)[j]].includes(row[columnsIndex[j]]) || columns === 0){
                    maching = true;
                }else{
                    maching = false;
                    j = columnsIndex.length;
                }
            }
            if(columns === 0) maching = true;
            if(maching){
                if(selected[0] == "row"){
                    result = [...result,[i]];
                }else if(resultIndex.length > 0 && typeof(selected[0]) === "string"){
                    let tmpRow = [];
                    for(let j = 0;j < resultIndex.length; j++){
                        tmpRow.push(row[resultIndex[j]]);
                    }

                    result = [...result, tmpRow];
                }
                maching = false;
            }
        }
        return jsonResult(result, selected);
    }

    deleteRow(tableName,query){
        if(this.database === "") return "no database selected";
        const tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        const conf = getTableConf(tablePath);
        let indexList = getIndexList(tablePath);
        if(indexList.length <= query.index+1 || query.index < 0) return "invalid Index.";

        deleteData(tablePath, indexList[query.index][0], indexList[query.index+1][0])
        indexList = deleteIndex(tablePath, indexList, conf, query.index);
        
        return ["deleted", indexList];
    }
    
    delete(tableName,query){
        if(this.database === "") return "no database selected";
        const tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        const conf = getTableConf(tablePath);
        let indexList = getIndexList(tablePath);
        query["select"] = "row";
        
        let result = this.find(tableName, query);
        if(Object.keys(result).length < 1) return "Nothing found to delete.";
        for(let i = Object.keys(result).length-1;i >= 0;i--){
            const query = {
                index: result[i].row
            }
            indexList = this.deleteRow(tableName,query)[1];
        }
        return "rows deleted."
    }

    updateRow(tableName, query){
        if(this.database === "") return "no database selected.";
        const tablePath = path(tableName, this.BDpath, this.database, this.tablesConfPath)+this.database+"."+tableName+".bdb";
        const conf = getTableConf(tablePath);
        const indexList = getIndexList(tablePath);

        if(indexList.length-1 < query.index) return "invalid Index.";
        if(Object.keys(query.update).length > conf.len) return "Inalid arguments.";
        let comlumnIndex = getColumnsIndex(conf, Object.keys(query.update));
        if(!areValidTypes(query.update, conf, comlumnIndex)) return "Invalid Types.";

        let row = readRow(tablePath, query.index, indexList);
        row = BuffToArray(row, conf);
        for(let i = 0;i < comlumnIndex.length;i++){
            row[comlumnIndex[i]] = query.update[Object.keys(query.update)[i]];
        }
        const deleteQuery = {
            index: query.index
        }
        this.deleteRow(tableName, deleteQuery);
        const insertQuery = {
            data: jsonResult([row], conf.names)[0]
        }
        this.insert(tableName, insertQuery)
        return "Updated";
    }

    update(tableName, query){
        if(this.database === "") return "no database selected.";
        const findQuery = {
            select: "row",
            where: query.where
        }
        const result = this.find(tableName, findQuery);
        if(Object.keys(result).length < 1) return "Nothing found to delete.";
        for(let i = Object.keys(result).length-1;i >= 0;i--){
            const updateQuery = {
                index: result[i].row,
                update: query.update
            }
            this.updateRow(tableName, updateQuery);
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
const db = new dbms();
db.BDpath = '../Databases/';
db.tablesConf = './.tables.conf';
console.log(db.selectDB("testDB"))
//console.log(db.newTable("users","id:0:au,name:25:string","C:\\Users\\gatsi\\OneDrive\\Υπολογιστής\\"))
var query = {
    data: {
        name: 'john',
        age: 505,
        image: Buffer.from("hellohell]")
    }
}
//console.log(db.insert("Products", query));
query = {
    index: 0
}
//db.deleteRow("products",query)
query = {
    where: {
        id: [1,2,3],
        age: [505]
    }
}
//console.log(db.delete("Products",query));
query = {
    index: 2,
    update: {
        name: "John_Gats"
    }
}
//console.log(db.updateRow("Products",query));
query = {
    where: {
        id: [1,2,3],
        age: [505]
    },
    update: {
        name: "John_Gats"
    }
}
//console.log(db.update("Products",query))
query = {
    select: 0,
    where: {
        id: [1,2,3],
        age: [505]
    }
}
console.log(db.find("Products",query));*/