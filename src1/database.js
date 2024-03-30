import { appendIndexe, deleteIndex, getIndexes,getTableConf, syncIndexList } from "./indexing.js";
import { validateUser } from "./lib/user.js";
import { bindbconfig } from "./config.js";
import { appendData, deleteRow, readRow } from "./lib/FileIO.js";
import { arrayToBuffer, bufferDataToArray,getColumnsIndex, updateValuesOfArray } from "./lib/tools.js";
import { dataArray } from "../test.js";

var validated = false;
var isOnValidationProcesse = false;

const conf = new bindbconfig();

export class databse{
    constructor(){
        this.username = "";
        this.password = "";
        this.databse = "";
        this.host = "";
        this.DBpath = "";
    }
    connect(username, password, databse, host){

        if(isOnValidationProcesse == false && validated == false){
            isOnValidationProcesse = true;
            this.DBpath = conf.DefaultDBpath + conf.DefaultDB;
            if(validateUser(this, username, password)){
                this.username = username;
                this.password = password;
                this.databse = databse;
                this.host = host;
                this.DBpath = conf.DefaultDBpath + databse+"/";
                isOnValidationProcesse = false;
                validated = true;
                return "connected";
            }
            this.databse = "";
            isOnValidationProcesse = false;
            return "not connected";
        }else{
            return "else";
        }
    }

    insert(tableName,ArrayData){
        if(chechSession() == "connected"){
            let tablePath = this.DBpath+"/"+tableName+".bin";

            let indexList = getIndexes(this.DBpath, tableName);
            let conf = getTableConf(this.DBpath, tableName);

            if(ArrayData.length == conf.length){
                appendIndexe(this.DBpath, tableName, parseInt(indexList[indexList.length-1])+arrayToBuffer(ArrayData).length)
                appendData(tablePath,arrayToBuffer(ArrayData));
                return "inseted ["+ArrayData+"] tO table: "+tableName;
            }else{
                return "array not the right lengh"
            }
        }else{
            return "Not connected";
        }
    }

    findWhere(tableName, selectColumns, columnsArray = 0, columnsValueArray = 0){
        if(chechSession() !== "connected"){return "Not connected"}
        
            let tablePath = this.DBpath+"/"+tableName+".bin";
            let indexList = getIndexes(this.DBpath, tableName);
            let conf = getTableConf(this.DBpath,tableName);
            let indexOfElement = getColumnsIndex(conf,columnsArray)
            let indexOfSelectColumns = getColumnsIndex(conf,selectColumns);

            let resultArray = [selectColumns];
            if(selectColumns == "*"){
                resultArray[0]=conf;
            }

            let data = "";
            for(let i = 0;i < indexList.length-1;i++){
                data = readRow(tablePath,parseInt(indexList[i]), parseInt(indexList[i+1]))[0];
                data = dataArray(conf, data);

                let j = 0;
                let tempData = [];
                let match = false;
                while(j < conf.length){
                    if(data[indexOfElement[j]] == columnsValueArray[j] && (data[indexOfElement[j]] != null && columnsValueArray[j] != null) || columnsValueArray == 0){
                        match = true;
                        if(selectColumns != "*"){
                            for(let y = 0;y < indexOfSelectColumns.length;y++){
                                tempData[y] = data[indexOfSelectColumns[y]];
                            }
                        }else{
                            tempData = data;
                        }
                    }else if(data[indexOfElement[j]] != columnsValueArray[j] && columnsValueArray != 0){
                        match = false;
                        j = conf.length;
                    }
                    j++;
                }
                if(match){
                    resultArray = [...resultArray,[tempData,parseInt(indexList[i])]];
                }
            }
            return resultArray;
    }

    delete(tableName,columnsArray = 0, columnsValueArray = 0){
        let tablePath = this.DBpath+"/"+tableName+".bin";
        let indexToDelete = this.findWhere(tableName, [], columnsArray, columnsValueArray);

        for(let i = indexToDelete.length-1;i >= 1;i--){
            deleteIndex(this.DBpath, tableName, indexToDelete[i][1]);
            deleteRow(tablePath, indexToDelete[i][1]);
        }
        return (indexToDelete.length-1)+" rows deleted";
    }

    update(tableName, columnsArray, oldColumnsValueArray, newColumnsValueArray, newColumnsArray = columnsArray){
        let tablePath = this.DBpath+"/"+tableName+".bin";
        let conf = getTableConf(this.DBpath,tableName);
        let columnsArrayIndex = getColumnsIndex(conf, columnsArray);
        let newColumnsArrayIndex = getColumnsIndex(conf, newColumnsArray);
        
        let indexToUpdate = this.findWhere(tableName, "*", columnsArray, oldColumnsValueArray);
        for(let i = indexToUpdate.length-1; i >=1; i--){
            deleteIndex(this.DBpath, tableName, indexToUpdate[i][1]);
            deleteRow(tablePath, indexToUpdate[i][1]);

            let newData = updateValuesOfArray(indexToUpdate[i][0], newColumnsArrayIndex, newColumnsValueArray);

            this.insert(tableName,newData)
        }
        return (indexToUpdate.length-1)+" rows updated";
    }
}

function chechSession(){
    if(validated == true || isOnValidationProcesse == true){
        return "connected";
    }
    return "disconnected";
}
let base = new databse();
console.log(base.connect("root","root123","testDB",""));
//syncIndexList(base.DBpath, "Products")
//console.log(base.insert("Products",["10","the title","100$","isudfg"]));
console.log(base.findWhere("Products",  ['title','description'], ['id','title','price'],["10","the title","100$"]));
//console.log(base.findWhere("Products",  [], ['id','title','price'],["10","the title","100$"]));
//console.log(base.findWhere("test", ['name']));
//console.log(base.findWhere("Products", "*"));
//console.log(base.delete("Products",  ['id'],["1"]));
console.log(base.findWhere("Products", "*"));
//console.log(base.update("Products",['id','title','price'],["10","the title","100$"], ["1", "kk tie"], ["id", "title"]))