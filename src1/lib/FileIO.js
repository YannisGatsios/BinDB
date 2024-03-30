import fs from 'fs';
import { arrayToBuffer,bufferDataToArray,endOfFirstVariable,shortenFile } from './tools.js';


export function readRow(path, indexStart = 0, endIndex=0){
    var data = fs.readFileSync(path);
    var buf = new Buffer.alloc(data.length-indexStart);
    data.copy(buf,0,indexStart,data.length);

    let rowEnd = endIndex-indexStart;
    if(endIndex === 0){
        rowEnd = endOfFirstVariable(buf);
    }
    var bufToSend = new Buffer.alloc(rowEnd);
    buf.copy(bufToSend,0,0,buf.length);

    return [bufToSend, indexStart+bufToSend.length];
}

export function appendData(path, Buffer){
    fs.appendFileSync(path, Buffer, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('Binary data saved to ', path);
        }
    });
}

export function deleteRow(path, indexStart = 0){
    let endIndex = readRow(path,indexStart)[1];
    let fileSize = fs.statSync(path).size;

    let index = endIndex;
    let [data, newIndex] = readRow(path,index);
    let newData = data;
    while (index < fileSize){
        [data, newIndex] = readRow(path,index);
        newData = Buffer.concat([newData,data])
        console.log(newData);
        index = newIndex;
    }
    shortenFile(path,indexStart);
    appendData(path,newData);
    shortenFile(path,fileSize-(endIndex-indexStart));
}



/*
let [data,rowEnd] = readRow("../../Databases/testDB/Products.bin");
console.log(DBtools.bufferDataToArray(data));
let array = DBtools.bufferDataToArray(data);

//appendData("../../Databases/testDB/Products.bin",data);

//console.log(DBtools.arrayToBuffer(array));
console.log(deleteRow("../../Databases/testDB/Products.bin",31));*/