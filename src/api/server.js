import http from 'http';
import { dbms } from '../dbms.js';
import { jsonResult } from '../lib/tools.js';
import { auth, error } from  './serverAuth.js'

var db = new dbms();
db.BDpath = "../"+db.BDpath;
db.tablesConfPath = "."+db.tablesConfPath;

var server = http.createServer((req,res) =>{
    if(req.url === "/api/login" && req.method === "POST"){
        auth.login(db, req, res)
    }else if(req.url === "/api/token" && req.method === "POST"){
        auth.token(db, req, res)
    }else if(req.url === "/api/find" && req.method === "GET"){
        handler.find(db, req, res)
    }else{
        res.writeHead(404 , {"content-type": "text/plain"});
        res.end("Not found");
    }
});



var handler = {
    find(db, req, res){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            const jsonData = JSON.parse(data);
            if(!jsonData["database"] || !jsonData["table"]) return res.end(error("Data is missing."));
            const database = jsonData.database;
            const table = jsonData.table;
            var resultColumns = 0;
            var columnsToSearch = 0;
            var valueOfColumn = 0;
            if(jsonData["resultColumns"]){resultColumns = jsonData.resultColumns.split(",");}
            if(jsonData["columnsToSearch"]){columnsToSearch = jsonData.columnsToSearch.split(",");}
            if(jsonData["valueOfColumn"]){valueOfColumn = jsonData.valueOfColumn.split(",");}
            auth.authenticateToken(db, req, res);
            if(res.statusCode === 200){
                if(db.selectDB(database) === "Invalid database."){
                    res.statusCode = 422;
                    return res.end(error("Invalid database."))
                }
                const find = db.find(table, resultColumns, columnsToSearch, valueOfColumn);
                db.unselectDB();
                var result = jsonResult(find[1],find[0]);
                return res.end(JSON.stringify(result));
            }
            return res.end(error("Invalid token."));
        });
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

server.listen(8080, () => console.log('Running at port '+8080));