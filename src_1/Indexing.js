const fs = require('fs');
const tools = require('./tools.js');
const binio = require('./DBCmds.js');

//const binio = require('./BinIO.js');
const filePath = "../Databases/CSV_DATABASE/Users.bin";
const newData = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x64]);
var sleepSetTimeout_ctrl;

console.log(binio.updateValue(12, newData, filePath));