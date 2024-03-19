import { readElement, readRow, refuctorData, updateElement,shortenFile,getElementIndex,appendData } from "./lib/DBio.js";
import {tableIndexList, insertIndex,updateIndex } from "./lib/indexing.js"
import { bindbconfig } from './config.js';
import { validateUser } from "./lib/user.js";
import fs from "fs";


var session = false;
var userValidetionOnGoing = false;
export class database{
    constructor() {
        this.conf = new bindbconfig();
        this.DBpath = this.conf.DefaultDBpath+this.conf.DefaultDB;

        this.username = "";
        this.passsword = "";
        this.database = this.conf.DefaultDB;
        this.host = this.conf.host; 
    }
    
    connect(username, passsword, database, host) {
        
        userValidetionOnGoing = true;
        if(validateUser(this,username,passsword)){
            this.username = username;
            this.passsword = passsword;
            this.database = database;
            
            this.host = host;
            this.conf.host = host;
            this.conf.hostlink = "http://"+this.host+":";
            
            this.DBpath = this.conf.DefaultDBpath+this.database;
            console.log("connected");
            session = true;
            userValidetionOnGoing = false;
            return true;
        }else{
            userValidetionOnGoing = false;
            return false;
            console.log("invalid Login credetials");
        }
    }
    
    chechSession(){
        if (session == false && userValidetionOnGoing == false){
            console.log("You are not loged in!!");
            process.kill(process.pid, 'SIGINT');
        }
    }
    //==insertion
    insert(tableName, arrayData, option = 0){
        this.chechSession();
        let tablePath = this.DBpath + "/" + tableName + ".bin";
        const [indexList,conf] = tableIndexList(this.DBpath, tableName);

        var finalDat;
        if (option == 0){
            if(arrayData.length!=conf.length-1){
                console.log("Array length doesn't match the tables configuration length\n You gave : "+arrayData+"\n table configuration : "+conf);
                return -1;
            }
            finalDat = refuctorData(arrayData);
        }else if(option == 1){
            finalDat = arrayData;
        }
        insertIndex(this.DBpath, tableName, finalDat, indexList[indexList.length-1]);
        appendData(tablePath, finalDat);
    }

    //==Finding.
    showAll(tableName){
        this.chechSession();
        const tablePath = this.DBpath + "/"+ tableName + ".bin";
        var arrayData = ["TABLE_EMPTY"];
        const [indexList,] = tableIndexList(this.DBpath, tableName);
        for(var i = 1; i<indexList.length-1;i++){
            arrayData[i-1] = readRow(tablePath, parseInt(indexList[i]))[0];
        }
        return arrayData;
    }

    findWhere(tebleName, elementName, value){
        this.chechSession();
        const tablePath = this.DBpath + "/"+ tebleName + ".bin";
        const [indexList,tableConfig] = tableIndexList(this.DBpath, tebleName);

        var elementIndex = getElementIndex(tableConfig, elementName);

        var resultArray = [];
        for (let i = 1; i <= indexList.length - 2; i++) {
            try {
                let dataRead = readRow(tablePath, parseInt(indexList[i]))[0];
                if (dataRead[elementIndex] == value) {
                    resultArray.push([dataRead, i]);
                }
            } catch (error) {
                console.error('Error reading row:', error);
            }
        }
        return resultArray;
    }

    //==Deleting.
    deleteRow(tebleName, indexOfRow){
        this.chechSession();
        const tablePath = this.DBpath + "/"+ tebleName + ".bin";
        var [indexList,] = tableIndexList(this.DBpath, tebleName);
        
        let difference = parseInt(indexList[indexOfRow])-parseInt(indexList[indexOfRow+1]);
        let data = new Uint8Array();
        for(var i = indexOfRow+1;i < indexList.length-1;i++){
            data = ([...data,...readElement(tablePath, parseInt(indexList[i]), this.conf.NEXT_ROW),this.conf.NEXT_ROW]);
            indexList[i-1] = (difference + parseInt(indexList[i])).toString();
        }
        indexList[i-1] = (difference + parseInt(indexList[i])).toString();
        indexList = indexList.slice(0,-1);
        
        fs.writeSync(fs.openSync(tablePath, "r+") , new Buffer.from(data), 0, data.length, parseInt(indexList[indexOfRow]));   
        shortenFile(tablePath,parseInt(indexList[indexList.length-1]));
        updateIndex(this.DBpath, tebleName);
    }

    delete(tebleName, WhereElement, elementValue){
        this.chechSession();
        var result = this.findWhere(tebleName, WhereElement, elementValue);
        while (result.length > 0) {
            this.deleteRow(tebleName, result[0][1]);
            
            // Update result for the next iteration
            result = this.findWhere(tebleName, WhereElement, elementValue);
            console.log(result);
        }
    }

    //==Updating.
    updateRow(tebleName, elementName, newValue, indexOfRow = 1){
        this.chechSession();
        const tablePath = this.DBpath + "/"+ tebleName + ".bin";
        var [indexList,tableConfig] = tableIndexList(this.DBpath, tebleName);

        var elementIndex = getElementIndex(tableConfig, elementName);
        let updatedRow = updateElement(this.DBpath, newValue, elementIndex, tebleName, indexList[indexOfRow]);
        this.deleteRow(tebleName, indexOfRow);
        this.insert(tebleName, updatedRow,1);
    }

    update(fromTable, whereElement, elementValue, newValue, updateElement = whereElement){
        this.chechSession();
        let resultLenght = this.findWhere(fromTable,whereElement,elementValue).length;
        for(var i = 0;i<resultLenght;i++){
            let result = this.findWhere(fromTable,whereElement,elementValue);
            this.updateRow(fromTable, updateElement,newValue,result[0][1]);
        }
    }
}


/*
var db = new database();
db.connect("root","root123","testDB","localhost");
console.log(db.showAll("Products"));
*/


//console.log(db);

/*
export var DBpath = select(DefaultDB);
var userValidated = false;

export function connect(username, passsword, database, host){
    
}

export function select(DBname){
    if(fs.existsSync(DefaultDBpath+"/"+DBname)){
        DBpath = DefaultDBpath+DBname;
        return DefaultDBpath+DBname;
    }else{
        console.log("Database Directory Does Not Exist.\nIf you think this is the right path you might have to change the [DefaultDBpath] value on the BinDB/src/config.js file.");
    }
}

function createDB(DBname){
    fs. mkdirSync(DefaultDBpath+"/"+DBname);
    fs. mkdirSync(DefaultDBpath+"/"+DBname+"/tablesindex");
    console.log("====\n'"+DBname+"' Created!\n====");
    DBpath = select(DBname);
}

function newTable(tableName, configuration){
    let conf = refuctorData(configuration);
    conf = [...conf,0x30,NEXT_ELEMENT];
    console.log(conf);
    fs.writeFileSync(DBpath+"/tablesIndex/"+ tableName + "_index.bin",new Buffer.from(conf));
    const fd = fs.openSync( DBpath + "/" + tableName + ".bin", 'w');
}
}*/
if (process.pid) {
    console.log('This process is your pid ' + process.pid);
}