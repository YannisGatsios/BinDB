const fs = require('fs');

function separateData(index, binaryData) {
  console.log('Index:', index);
  console.log('Binary Data Length:', binaryData.length);

  if (index < 0 || index > binaryData.length) {
      console.log('Invalid index condition met');
      throw new Error('Invalid index');
  }
  const firstPart = binaryData.slice(0, index);
  const secondPart = binaryData.slice(index);
  return [new Uint8Array(firstPart), new Uint8Array(secondPart)];
}

function separateRowData(index, data){
  console.log('Index:', index);
  console.log('Binary Data Length:', data.length);

  if (index < 0 || index > data.length) {
      console.log('Invalid index condition met');
      throw new Error('Invalid index');
  }
  const divData1 = data.slice(0, index);
  const divData2 = data.slice(index);
  return [divData1 , divData2];
}

function add0xFFAtEndOfArray(binaryData) {
  const combinedData = new Uint8Array([...binaryData, ...[0xFF]]);
  return combinedData;
}

function combineData(binaryData1, binaryData2) {
    const combinedData = new Uint8Array([...binaryData1, ...binaryData2]);
    return combinedData;
}

function endOfFirstVariable(binaryData) {
    const endIndex = binaryData.indexOf(0xFF);
    if (endIndex === 0) {
      return binaryData.length;
    }
    return endIndex;
}

async function readFileAsync(filePath) {
  try {
    const data = await fs.promises.readFile(filePath);
    return data;
  } catch (error) {
    throw error;
  }
}

// Using an async function to read the file and create Uint8Array
async function readAndCreateUint8Array(filePath) {
  try {
    const binaryDataBuffer = await readFileAsync(filePath);
    const binaryData = new Uint8Array(binaryDataBuffer);
    console.log(binaryData);
    return binaryData;  // Add this line to return the binaryData
  } catch (error) {
    console.error('Error:', error);
    throw error;  // Rethrow the error to propagate it
  }
}

async function revomeSpecificDataFromArray(index, data){
  const [firstPartFinal, secondPart] = separateData(index, data);
  const [, secondPartFinal] = separateData(endOfFirstVariable(secondPart), secondPart);
  return [new Uint8Array(firstPartFinal), new Uint8Array(secondPartFinal)];
}

module.exports = {
    separateData: separateData,
    combineData: combineData,
    endOfFirstVariable: endOfFirstVariable,
    readFileAsync: readFileAsync,
    readAndCreateUint8Array: readAndCreateUint8Array,
    add0xFFAtEndOfArray: add0xFFAtEndOfArray,
    separateRowData: separateRowData,
    revomeSpecificDataFromArray: revomeSpecificDataFromArray,
}