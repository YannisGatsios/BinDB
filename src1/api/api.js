import http from 'http';
import { bindbconfig } from '../config.js';
import { requestData } from '../lib/tools.js';
//import { databse } from "../database.js";

const conf = new bindbconfig();
var sessionCounter = [];

const server = http.createServer((req,res) =>{
    console.log(req.url+" = "+req.method);
    if(req.url === '/api/connect' && req.method === "GET"){
        res.writeHead(200, { 'content-type': 'application/json'});

        let data = "";
        req.on('data', (chunk) =>{
            data += chunk;
        })
        req.on('end', () => {
            const jsonData = JSON.parse(data);
            let username = requestData(jsonData.username);
            let password = requestData(jsonData.password);
            let datatbase = requestData(jsonData.database);
            let host = requestData(jsonData.host);

            res.end(username+password+datatbase+host);
        })
    }else{
        res.writeHead(404, { 'content-type': 'application/json'});
        res.end("Not Found");
    }
})

const PORT = conf.port || 8080;

server.listen(8080, () => console.log('Running at port '+PORT));