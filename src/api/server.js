import http from 'http';
import { dbms } from '../dbms.js';
import { jsonToArray,jsonResult } from '../lib/tools.js';
import { auth, error } from  './serverAuth.js'

var db = new dbms();
db.BDpath = "../"+db.BDpath;
db.tablesConfPath = "."+db.tablesConfPath;

var server = http.createServer((req,res) =>{
    if(req.url === "/api/login" && req.method === "POST"){
        auth.login(db, req, res);
    }else if(req.url === "/api/token" && req.method === "POST"){
        auth.token(db, req, res);
    }else if(req.url === "/api/find" && req.method === "POST"){
        handler.find(db, req, res);
    }else  if(req.url === "/api/insert" && req.method === "POST"){
        handler.insert(db, req, res);
    }else  if(req.url === "/api/deleteRow" && req.method === "DELETE"){
        handler.deleteRow(db, req, res);
    }else  if(req.url === "/api/delete" && req.method === "DELETE"){
        handler.delete(db, req, res);
    }else  if(req.url === "/api/updateRow" && req.method === "PATCH"){
        handler.updateRow(db, req, res);
    }else  if(req.url === "/api/update" && req.method === "PATCH"){
        handler.update(db, req, res);
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
            if(!jsonData["database"] || !jsonData["table"] || !jsonData["query"]) return res.end(error("Data is missing."));
            if(Object.keys(jsonData.query).length > 2 || !Object.keys(jsonData.query).includes("select") || !Object.keys(jsonData.query).includes("where")) return res.end(error("Invalid query."));
            auth.authenticateToken(db, req, res);
            if(res.statusCode === 401 || res.statusCode === 403) return res.end(error("Inavlid token."));
            
            if(res.statusCode === 200){
                if(db.selectDB(jsonData["database"]) === "Invalid database."){
                    res.statusCode = 422;
                    return res.end(error("Invalid database."))
                }

                const result = db.find(jsonData["table"], jsonData.query);
                db.unselectDB();

                return res.end(JSON.stringify(result));
            }
            return res.end(error("Invalid token."));
        });
    },
    insert(db, req, res){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            const jsonData = JSON.parse(data);
            if(!jsonData["database"] || !jsonData["table"] || !jsonData["query"]) return res.end(error("Data is missing."));
            if(Object.keys(jsonData.query).length > 1 || !Object.keys(jsonData.query).includes("data")) return res.end(error("Invalid query."));
            auth.authenticateToken(db, req, res);
            if(res.statusCode === 401 || res.statusCode === 403) return res.end(error("Inavlid token."));

            if(res.statusCode === 200){
                jsonData.query.data = jsonResult([jsonToArray(jsonData.query.data)],Object.keys(jsonData.query.data))[0];
                if(db.selectDB(jsonData["database"]) === "Invalid database."){
                    res.statusCode = 422;
                    return res.end(error("Invalid database."))
                }
                const message = db.insert(jsonData.table, jsonData.query);
                db.unselectDB();
                if(message === "Inserted"){
                    return res.end(JSON.stringify({"result": message}))
                }
                res.statusCode = 400;
                return res.end(error(message));
            }
            return res.end(error("Invalid data"));
        });
    },
    deleteRow(db, req, res){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            const jsonData = JSON.parse(data);
            if(!jsonData["database"] || !jsonData["table"] || !jsonData["query"]) return res.end(error("Data is missing."));
            auth.authenticateToken(db, req, res);
            if(res.statusCode === 401 || res.statusCode === 403) return res.end(error("Inavlid token."));
            if(res.statusCode === 200){
                if(db.selectDB(jsonData["database"]) === "Invalid database."){
                    res.statusCode = 422;
                    return res.end(error("Invalid database."))
                }
                const message = db.deleteRow(jsonData.table, jsonData.query);
                db.unselectDB();
                if(message === "deleted"){
                    return res.end(JSON.stringify({"result": message}))
                }
                res.statusCode = 400;
                return res.end(error(message));
            }
            return res.end(error("Invalid data"));
        });
    },
    delete(db, req, res){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            const jsonData = JSON.parse(data);
            if(!jsonData["database"] || !jsonData["table"] || !jsonData["query"]) return res.end(error("Data is missing."));
            auth.authenticateToken(db, req, res);
            if(res.statusCode === 401 || res.statusCode === 403) return res.end(error("Inavlid token."));
            if(res.statusCode === 200){
                if(db.selectDB(jsonData["database"]) === "Invalid database."){
                    res.statusCode = 422;
                    return res.end(error("Invalid database."))
                }
                const message = db.delete(jsonData.table, jsonData.query);
                db.unselectDB();
                if(message === "rows deleted." || message === "Nothing found to delete."){
                    return res.end(JSON.stringify({"result": message}))
                }
                res.statusCode = 400;
                return res.end(error(message));
            }
            return res.end(error("Invalid data"));
        });
    },
    updateRow(db, req, res){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            const jsonData = JSON.parse(data);
            if(!jsonData["database"] || !jsonData["table"] || !jsonData["query"]) return res.end(error("Data is missing."));
            auth.authenticateToken(db, req, res);
            if(res.statusCode === 401 || res.statusCode === 403) return res.end(error("Inavlid token."));
            if(res.statusCode === 200){
                if(db.selectDB(jsonData["database"]) === "Invalid database."){
                    res.statusCode = 422;
                    return res.end(error("Invalid database."))
                }
                const message = db.updateRow(jsonData.table, jsonData.query);
                db.unselectDB();
                if(message === "Updated"){
                    return res.end(JSON.stringify({"result": message}))
                }
                res.statusCode = 400;
                return res.end(error(message));
            }
            return res.end(error("Invalid data"));
        });
    },
    update(db, req, res){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            const jsonData = JSON.parse(data);
            if(!jsonData["database"] || !jsonData["table"] || !jsonData["query"]) return res.end(error("Data is missing."));
            auth.authenticateToken(db, req, res);
            if(res.statusCode === 401 || res.statusCode === 403) return res.end(error("Inavlid token."));
            if(res.statusCode === 200){
                if(db.selectDB(jsonData["database"]) === "Invalid database."){
                    res.statusCode = 422;
                    return res.end(error("Invalid database."))
                }
                const message = db.update(jsonData.table, jsonData.query);
                db.unselectDB();
                if(message === "rows updated."|| message === "Nothing found to update."){
                    return res.end(JSON.stringify({"result": message}))
                }
                res.statusCode = 400;
                return res.end(error(message));
            }
            return res.end(error("Invalid data"));
        });
    }
}

server.listen(80, () => console.log('Running at port '+80));

function jsonExists(jsonValue){
    if(!jsonValue) return 0;
    if(typeof(jsonValue) === "string") return jsonValue.split(",");
    return jsonValue
}