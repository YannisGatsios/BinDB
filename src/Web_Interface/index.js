import http from 'http';
import { database } from '../database.js';
import { tableIndexList } from '../lib/indexing.js';

var base = new database();


const PORT = base.conf.port;
const NEXT_ROW = base.conf.NEXT_ROW;
const NEXT_ELEMENT = base.conf.NEXT_ELEMENT;

const server = http.createServer((req,res) => {
    console.log(req.url+" : "+req.method);
    if(req.url === '/connect' && req.method === 'POST'){
        res.writeHead(200, {'Constent-type':'text/plain'});
        
        let request = '';
        var query = '';
        var result = false;
        req.on('data', function(chunk){
            request = new Uint8Array(chunk.toString().split(","));
            query = dataToStringArray(request);
            result = base.connect(query[0],query[1],query[2],query[3]);
        });

        req.on('end', function(){
            if (result == true){
                res.end("connected");
            }else{
                res.end("Failed Log in");
            }

        });

    }else if(req.url === '/showAll' && req.method === 'POST'){
        res.writeHead(201, {'Constent-type':'text/plain'});

        var request = '';
        var result = '';
        req.on('data', function(chunk){
            request += chunk;
        });
        
        req.on('end', function(){
            result = base.showAll(dataToStringArray(new Uint8Array(request.toString().split(",")))[0]);
            res.end(result.toString());
        });
    }else if(req.url === '/insert' && req.method === 'POST'){
        res.writeHead(201, {'Constent-type':'text/plain'});

        let request = '';
        var query = '';
        var result = '';
        req.on('data', function(chunk) {
            request += chunk;
        });
    
        req.on('end', function() {
            query = dataToStringArray(new Uint8Array(request.toString().split(",")));
            result = base.insert(query[0], query.slice(1));
    
            res.end("inserted");
        });
    }else if(req.url === '/findWhere' && req.method === 'POST'){
        res.writeHead(200, {'Constent-type':'text/plain'});

        let request = '';
        var query = '';
        let result = '';
        req.on('data', function(chunk){
            request = new Uint8Array(chunk.toString().split(","));
            query = dataToStringArray(request);
            result = base.findWhere(query[0],query[1],query[2]);
        });
        
        req.on('end', function(){
            res.end(result.toString());
        });
    }else if(req.url === '/deleteRow' && req.method === 'POST'){
        res.writeHead(200, {'Constent-type':'text/plain'});

        let request = '';
        var query = '';
        req.on('data', function(chunk){
            request += chunk; 
        });
        
        req.on('end', function(){
            query = dataToStringArray(new Uint8Array(request.toString().split(",")));
            console.log(parseInt(query[1]));
            base.deleteRow(query[0],parseInt(query[1]));
            res.end("Deleted from "+query[0]+" the "+query[1]+"th element");
        });
    }else if(req.url === '/delete' && req.method === 'POST'){
        res.writeHead(200, {'Constent-type':'text/plain'});

        let request = '';
        var query = '';
        req.on('data', function(chunk){
            request = new Uint8Array(chunk.toString().split(","));
            query = dataToStringArray(request);
            base.delete(query[0],query[1],query[2]);
        });
        
        req.on('end', function(){
            res.end("Deleted from "+query[0]+" where "+query[1]+" is "+query[2]);
        });
    }else if(req.url === '/updateRow' && req.method === 'PATCH'){
        res.writeHead(200, {'Constent-type':'text/plain'});

        let request = '';
        var query = '';
        req.on('data', function(chunk){
            request = new Uint8Array(chunk.toString().split(","));
            query = dataToStringArray(request);
            base.updateRow(query[0],query[1],query[2],parseInt(query[3]));
        });
        
        req.on('end', function(){
            res.end("Deleted from "+query[0]+" where "+query[1]+" is "+query[2]);
        });
    }else if(req.url === '/update' && req.method === 'PATCH'){
        res.writeHead(200, {'Constent-type':'text/plain'});

        let request = '';
        var query = '';
        req.on('data', function(chunk){
            request = new Uint8Array(chunk.toString().split(","));
            query = dataToStringArray(request);
            base.update(query[0],query[1],query[2],query[3],query[4]);
        });
        
        req.on('end', function(){
            res.end("Deleted from "+query[0]+" where "+query[1]+" is "+query[2]);
        });
    }else if(req.url === '/tableConf' && req.method === 'POST'){
        res.writeHead(200, {'Constent-type':'text/plain'});

        let request = '';
        var query = '';
        req.on('data', function(chunk){
            request += chunk;
        });
        
        req.on('end', function(){
            query = dataToStringArray(new Uint8Array(request.toString().split(",")));
            let [, tableConf] = tableIndexList(base.conf.DefaultDBpath+base.database,query[0]);
            res.end(tableConf.toString());
        });
    }else{
        res.writeHead(404, {'Constent-type':'text/plain'});
        res.end("404 Not Found");
    }
});

server.listen(PORT, ()=>{
    console.log("server is running at "+PORT);
});

function dataToStringArray(data){
    var array = [];
    let index = 0;
    let tempStr = '';
    for (var i = 0; i < data.byteLength; i++) {
        if (data[i] == NEXT_ELEMENT || data[i] == NEXT_ROW){
            array[index] = tempStr;
            tempStr = '';
            index++;
        }else{
            tempStr = tempStr+new TextDecoder().decode(data)[i];
        }
    }
    return array;
}