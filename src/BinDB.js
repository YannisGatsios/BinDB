import { refuctorData } from "./lib/DBio.js";
import http from 'http';


var HOST;

export class BinDB{
    connect(username, password, database, host){
        const connect = '114,111,111,116,255,114,111,111,116,49,50,51,255,116,101,115,116,68,66,255,108,111,99,97,108,104,111,115,116,255';
        HOST = host;
        const options = {
              hostname: host.split(':')[0] ,
              port: host.split(':')[1],
              path: '/connect',
              method: 'POST',
              headers: {
                  'Content-Type': 'text/plain',
              },
          };
          
          // Create a request object
          const request = http.request(options, (response) => {
              let data = '';
            
              // A chunk of data has been received.
              response.on('data', (chunk) => {
                data += chunk;
              });
            
              // The whole response has been received.
              response.on('end', () => {
                console.log('Connncet: ', data);
              });
          });
          // Handle potential errors
          request.on('error', (error) => {
              console.error('Error:', error);
          });
          
          // Send the request with the body data
          const requestData = refuctorData([username,password,database,host.split(':')[0]]).toString();
          request.write(requestData);
          request.end();
    }

    async tableConf(tableName){
        const options = {
            hostname: HOST.split(':')[0] ,
            port: HOST.split(':')[1],
            path: '/tableConf',
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
        };
        
        let result = "";
        // Create a request object
        const request = http.request(options, (response) => {
            let data = '';
          
            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });
          
            // The whole response has been received.
            response.on('end', () => {
                console.log('TableName: '+tableName+": ", data);
                
            });
        });
        // Handle potential errors
        request.on('error', (error) => {
            console.error('Error:', error);
        });
        
        // Send the request with the body data
        var requestData = refuctorData([tableName]).toString();
        request.write(requestData.replace(/,253/g, ''));
        request.end();
        return result.split(",");
    }

    insert(tableName, arrayData){
        const options = {
              hostname: HOST.split(':')[0] ,
              port: HOST.split(':')[1],
              path: '/insert',
              method: 'POST',
              headers: {
                  'Content-Type': 'text/plain',
              },
          };
          
          // Create a request object
          const request = http.request(options, (response) => {
              let data = '';
            
              // A chunk of data has been received.
              response.on('data', (chunk) => {
                  data += chunk;
              });
            
              // The whole response has been received.
              response.on('end', () => {
                  console.log('Insert: ', data);
              });
          });
          // Handle potential errors
          request.on('error', (error) => {
              console.error('Error:', error);
          });
          
          // Send the request with the body data
          var requestData = refuctorData([tableName]).toString()+","+refuctorData(arrayData).toString();
          request.write(requestData.replace(/,253/g, ''));
          request.end();
    }

    showAll(tableName){
        const options = {
              hostname: HOST.split(':')[0] ,
              port: HOST.split(':')[1],
              path: '/showAll',
              method: 'POST',
              headers: {
                  'Content-Type': 'text/plain',
              },
          };
          
          // Make the POST request
          const req = http.request(options, (res) => {
            let data = '';
          
            // A chunk of data has been received.
            res.on('data', (chunk) => {
                data += chunk;
            });
          
            // The whole response has been received.
            res.on('end', () => {
                console.log('Show All: ', data);
            });
          });
          
          // Handle errors in the request
          req.on('error', (error) => {
              console.error('Error:', error.message);
          });
          
        // Send the "hello" message in text/plain format
        var requestData = refuctorData([tableName]).toString();
        req.write(requestData.replace(/,253/g, ''));
        req.end();
    }
    findWhere(tebleName, elementName, value){
        const options = {
            hostname: HOST.split(':')[0] ,
            port: HOST.split(':')[1],
            path: '/findWhere',
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
        };
        
        // Create a request object
        const request = http.request(options, (response) => {
            let data = '';
          
            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });
          
            // The whole response has been received.
            response.on('end', () => {
                console.log('FIindWhere: ', data);
            });
        });
        // Handle potential errors
        request.on('error', (error) => {
            console.error('Error:', error);
        });
        
        // Send the request with the body data
        var requestData = refuctorData([tebleName, elementName, value]).toString();
        request.write(requestData.replace(/,253/g, ''));
        request.end();
    }
    deleteRow(tebleName, indexOfRow){
        indexOfRow = indexOfRow.toString();
        const options = {
            hostname: HOST.split(':')[0] ,
            port: HOST.split(':')[1],
            path: '/deleteRow',
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
        };
        
        // Create a request object
        const request = http.request(options, (response) => {
            let data = '';
          
            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });
          
            // The whole response has been received.
            response.on('end', () => {
                console.log('DeleteRow: ', data);
            });
        });
        // Handle potential errors
        request.on('error', (error) => {
            console.error('Error:', error);
        });
        
        // Send the request with the body data
        var requestData = refuctorData([tebleName, indexOfRow]).toString();
        request.write(requestData.replace(/,253/g, ''));
        request.end();
    }
    delete(tebleName, whereElement, elementValue){
        const options = {
            hostname: HOST.split(':')[0] ,
            port: HOST.split(':')[1],
            path: '/delete',
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
        };
        
        // Create a request object
        const request = http.request(options, (response) => {
            let data = '';
          
            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });
          
            // The whole response has been received.
            response.on('end', () => {
                console.log('DeleteRow: ', data);
            });
        });
        // Handle potential errors
        request.on('error', (error) => {
            console.error('Error:', error);
        });
        
        // Send the request with the body data
        var requestData = refuctorData([tebleName, whereElement, elementValue]).toString();
        request.write(requestData.replace(/,253/g, ''));
        request.end();
    }
    updateRow(tebleName, elementName, newValue, indexOfRow = 1){
        indexOfRow = indexOfRow.toString();
        const options = {
            hostname: HOST.split(':')[0] ,
            port: HOST.split(':')[1],
            path: '/updateRow',
            method: 'PATCH',
            headers: {
                'Content-Type': 'text/plain',
            },
        };
        
        // Create a request object
        const request = http.request(options, (response) => {
            let data = '';
          
            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });
          
            // The whole response has been received.
            response.on('end', () => {
                console.log('UpdateRow: ', data);
            });
        });
        // Handle potential errors
        request.on('error', (error) => {
            console.error('Error:', error);
        });
        
        // Send the request with the body data
        var requestData = refuctorData([tebleName, elementName, newValue, indexOfRow]).toString();
        request.write(requestData.replace(/,253/g, ''));
        request.end();
    }
    update(fromTable, whereElement, elementValue, newValue, updateElement = whereElement){
        const options = {
            hostname: HOST.split(':')[0] ,
            port: HOST.split(':')[1],
            path: '/update',
            method: 'PATCH',
            headers: {
                'Content-Type': 'text/plain',
            },
        };
        
        // Create a request object
        const request = http.request(options, (response) => {
            let data = '';
          
            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });
          
            // The whole response has been received.
            response.on('end', () => {
                console.log('Update: ', data);
            });
        });
        // Handle potential errors
        request.on('error', (error) => {
            console.error('Error:', error);
        });
        
        // Send the request with the body data
        var requestData = refuctorData([fromTable, whereElement, elementValue, newValue, updateElement]).toString();
        request.write(requestData.replace(/,253/g, ''));
        request.end();
    }
}

var db = new BinDB();
await db.connect("root","root123","testDB","localhost:8080");
db.insert("Products",["20","root1","100$","john"]);
db.showAll("Products");
db.findWhere("Products","id","20");
//db.deleteRow("Products", 1);
//db.delete("Products","id", "20");
//db.updateRow("Products","id", "0");
db.update("Products","id", "root","0");
console.log(await db.tableConf("Products"));