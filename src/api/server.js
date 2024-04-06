import http from 'http';
import { dbms } from '../dbms.js';
import { jsonResult } from '../lib/tools.js';
import { auth, error } from  './serverAuth.js'

var db = new dbms();
db.BDpath = "../"+db.BDpath;
db.tablesConfPath = "."+db.tablesConfPath;

var server = http.createServer((req,res) =>{
    if(req.url === "/api/login" && req.method === "POST"){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            const jsonData = JSON.parse(data);
            res.end(auth.login(db, res, jsonData))
        });
    }else if(req.url === "/api/token" && req.method === "GET"){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            const jsonData = JSON.parse(data);
            res.end(auth.token(db, req, res, jsonData))
        });
    }else if(req.url === "/api/find" && req.method === "GET"){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            const jsonData = JSON.parse(data);
            res.end(server.find(req, res, jsonData))
        });
    }else{
        res.writeHead(404 , {"content-type": "text/plain"});
        res.end("Not found");
    }
});

server.listen(8080, () => console.log('Running at port '+8080));

var server = {
    find(req, res, jsonData){
        if(!jsonData["database"] || !jsonData["table"]) return error("Data is missing.")
        const database = jsonData.database;
        const table = jsonData.table;
        var resultColumns = 0;
        var columnsToSearch = 0;
        var valueOfColumn = 0;
        if(jsonData["resultColumns"]){resultColumns = jsonData.resultColumns.split(",");}
        if(jsonData["columnsToSearch"]){columnsToSearch = jsonData.columnsToSearch.split(",");}
        if(jsonData["valueOfColumn"]){valueOfColumn = jsonData.valueOfColumn.split(",");}
        db.selectDB(database);
        auth.authenticateToken(req, res);
        if(res.statusCode === 200){
            res.setHeader('Content-Type', 'application/json');
            const find = db.find(table, resultColumns, columnsToSearch, valueOfColumn)
            var result = jsonResult(find[1],find[0]);
            return JSON.stringify(result);
        }
        return error("Invalid token.")
    },
    insert(req, res, jsonData){
        
    },
    deleteRow(req, res, jsonData){

    },
    delete(req, res, jsonData){

    },
    updateRow(req, res, jsonData){

    },
    update(req, res, jsonData){

    }
}