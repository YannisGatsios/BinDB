const fs = require('fs');
const tools = require('./tools.js');

// Sample binary data (array of bytes)
const BinData = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x64]);
const filePath = '../Databases/CSV_DATABASE/Users.bin';

function insertNewData(binaryData) {
    // Insert new binary data to the file
    fs.appendFile(filePath, binaryData, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('Binary data saved to', filePath);
        }
    });
}
async function writeToBase(index, binaryData, filePath) {
    try {
        const fd = await fs.promises.open(filePath, 'r+');
        console.log('File descriptor opened:', fd);
        await fd.write(binaryData, 0, binaryData.length, index);
        console.log('Binary data written to file');
        await fd.close();
        console.log('File descriptor closed');
    } catch (error) {
        console.error('Error writing file:', error);
    }
}


async function updateSpecificData(index, data, newData) {
    // Insert new binary data to the file
    console.log("before writing");
    const [, secondPart] = await tools.revomeSpecificDataFromArray(index, data);
    const finalData = tools.combineData(newData ,secondPart);
    console.log("after writing");
    return finalData;
}


async function readSpecificData(startIndex, filePath) {
    try{
        const binaryDataBuffer = await tools.readFileAsync(filePath);
        const [, data2] = tools.separateRowData(startIndex, binaryDataBuffer);
        const endIndex = tools.endOfFirstVariable(data2);
        const [dataPart] = tools.separateRowData(endIndex, data2);
        return dataPart;
    }catch(error){
        console.error('Error in readSpecificData :', error);
        throw error;
    }
}

async function readFromBase(filePath) {
    try {
        const fileCont = await tools.readAndCreateUint8Array(filePath);
        return fileCont;
    } catch (error) {
        console.error('Error reading file :', error);
        throw error;
    }
}

async function deleteData(index, filePath){
    try {
        const baseData = await readFromBase(filePath);
        const [firstPart, secondPart] = await tools.revomeSpecificDataFromArray(index, baseData);
        const binaryDataFinal = tools.combineData(firstPart, secondPart);
        return binaryDataFinal;
    } catch (error) {
        console.error('Error in deleteData :', error);
        throw error;
    }
}

module.exports = {
    writeToBase: writeToBase,
    updateSpecificData: updateSpecificData,
    readFromBase: readFromBase,
};

async function functionTest(funct,name){
    const result = await(funct);
    console.log("Test result for ",name," : ", result);
}
//functionTest(deleteData(12, filePath),"deleteData");
//functionTest(readFromBase(filePath),"readFromBase");
//functionTest(readSpecificData(12, filePath), "readSpecificData");
//functionTest(updateSpecificData(5, BinData, [0x00, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64,0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64,0x6F, 0x20, 0x57, 0x00]),"updateSpecificData");



async function test1(){
    try {
        const index = 12;
        const fileData = await readFromBase(filePath);
        console.error('read datat done');
        const data = await updateSpecificData(index, fileData, BinData);
        console.error('Data upadated');
        await writeToBase(index, data, filePath);
    } catch (error) {
        console.error('Error reading file :', error);
        throw error;
    }
}
//test1();

