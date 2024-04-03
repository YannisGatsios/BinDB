import fs from 'fs';
import { shortenFile } from './tools.js';


export function readData(path, indexStart, endIndex = fs.statSync(path).size){
    var data = fs.readFileSync(path);
    var buf = new Buffer.alloc(data.length-indexStart);
    data.copy(buf,0,indexStart,data.length);

    var bufToSend = new Buffer.alloc(endIndex-indexStart);
    buf.copy(bufToSend,0,0,buf.length);
    return bufToSend;
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

export function deleteData(path, indexStart,endIndex = fs.statSync(path).size){
    let fileSize = fs.statSync(path).size;
    let data = readData(path,indexStart,fileSize);

    let newData = data.slice(endIndex-indexStart);
    console.log(newData)

    shortenFile(path,indexStart);
    appendData(path,newData);
}

/*
let read = readData("../../Databases/testDB/Products.bin",fs.statSync("../../Databases/testDB/Products.bin").size-2);
console.log(read)
deleteData("../../Databases/testDB/Products.bin",5);*/