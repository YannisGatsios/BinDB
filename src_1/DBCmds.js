//Basic Database Commands 
const binio = require("./BinIO.js");

const newData = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x64]);
const filePath = '../Databases/CSV_DATABASE/Users.bin';

async function updateValue(index, newData, filePath){
    try {
        const fileData = await binio.readFromBase(filePath);
        console.error('read datat done');
        const data = await binio.updateSpecificData(index, fileData, newData);
        console.error('Data upadated');
        await binio.writeToBase(index, data, filePath);
    } catch (error) {
        console.error('Error reading file :', error);
        throw error;
    }
}
module.exports = {
    updateValue: updateValue,
};