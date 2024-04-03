import { readRow, appendData } from "./src1/lib/FileIO.js";
import { bufferDataToArray } from "./src1/lib/tools.js";
import {bindbconfig} from './src1/config.js';

var conf = new bindbconfig();
const NEXT_ELEMENT = conf.NEXT_ELEMENT;
const NEXT_ROW = conf.NEXT_ROW;

let DBpath = "./Databases/testDB/";

let tableConf = ["name","file:image", "stuff", "file:newImage"];
let inedxList = [100325,200649];
//file length 50149
//let rowdata = readRow("./test.bin",inedxList[0],inedxList[1])[0]


export function dataArray(tableConf, rowdata){
    let array = [];
    let index = 0;
    let fileLength = 0;
    let tempStr = '';
    let tableConfIndex = 0;
    for (let i = 0; i < rowdata.length-1; i++) {

        if(tableConf[tableConfIndex].split(':').includes("file")){
            if(fileLength === 0){
                if (rowdata[i] == NEXT_ELEMENT){
                    fileLength = parseInt(tempStr);
                    tempStr = '';
                }else{
                    tempStr = tempStr+String.fromCharCode(rowdata[i]);
                }
            }else{
                index++;
                tableConfIndex++;
                array = [...array,Buffer.from(rowdata.slice(i,fileLength+i+1))]
                i += fileLength;
                fileLength = 0;
            }
        }else{
            if (rowdata[i] == NEXT_ELEMENT){
                array[index] = tempStr;
                tempStr = '';
                index++;
                tableConfIndex++;
            }else{
                tempStr = tempStr+String.fromCharCode(rowdata[i]);
            }
        }
    }
    return array
}
//console.log(array);

/*
//============array to buffer=========
let newData = Buffer.alloc(0);
for(let i = 0;i < array.length;i++){
    if(Buffer.isBuffer(array[i])){
        newData = Buffer.concat([newData, Buffer.from((array[i].length-1).toString(),'utf8'),Buffer.from(NEXT_ELEMENT.toString(16), 'hex'), array[i]])
    }else{
        newData = Buffer.concat([newData,Buffer.from(array[i],'utf8'),Buffer.from(NEXT_ELEMENT.toString(16), 'hex')])
    }
}
newData = Buffer.concat([newData,Buffer.from(NEXT_ROW.toString(16), 'hex')])
console.log(newData)*/

//appendData("./test.bin", newData)