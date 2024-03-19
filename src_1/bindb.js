import { readElement, readRow, refuctorData, updateElement,shortenFile } from "../src/lib/DBio.js";
import { NEXT_ELEMENT,NEXT_ROW,DefaultDBpath,DefaultDB } from '../src/config.js';
import fs from "fs";

//console.log(indexList, tableConfig);
export var DBpath = select("testDB");
var userValidated = false;

export function select(DBname){
    if(fs.existsSync(DefaultDBpath+"/"+DBname)){
        DBpath = DefaultDBpath+DBname;
        return DefaultDBpath+DBname;
    }else{
        console.log(DefaultDBpath+"/"+DBname+"Database Directory Does Not Exist.\nIf you think this is the right path you might have to change the [DefaultDBpath] value on the BinDB/src/config.js file.");
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

//=\/==========Basic commands============\/=
//createDB("newDB");
//select("newDB");
//newTable("Products",["id","title","price","description"]);