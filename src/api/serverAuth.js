import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { user } from '../lib/user.js';

var privateAccesKey = crypto.randomBytes(64).toString('hex');

export var auth = {
    login(db , res, jsonData){
        const username = jsonData.username;
        const password = jsonData.password;
        if(user.validateUser(db,username,password)){
            res.setHeader('Content-Type', 'application/json');
            const user = {username: username}
            const refreshKey = crypto.randomBytes(64).toString('hex');
            const refreshToken = jwt.sign(user, refreshKey);
            const accesToken = this.generateAccesToken(user, privateAccesKey);
            db.update("users",["username"],[username],["token"],[refreshKey]);
            db.unselectDB();
            res.setHeader('authorization', refreshToken);
            return JSON.stringify({accesToken: accesToken});
        }
        return error("Invalid login credetials.");
    },
    token(db, req, res, jsonData){
        const username = jsonData.username;
        db.selectDB("BinDB");
        const refreshTokenKey = db.find("users",["token"],["username"],[username]);
        this.authenticateToken(req, res, refreshTokenKey[1][0][0]);
        if(res.statusCode === 200 && req.user.username === username){
            const user = {username: username};
            const accesToken = this.generateAccesToken(user, privateAccesKey);
            return JSON.stringify({accesToken: accesToken});
        }
        return error("invelid authorization credetials.")
    },
    authenticateToken(req, res, privateKey = privateAccesKey){
        const token = req.headers['authorization'];
        if(token === null) return res.statusCode = 401;
    
        var data = "";
        jwt.verify(token, privateKey, (err,user) => {
            if(err) return res.statusCode = 403;
            data += user;
            res.statusCode = 200
            req.user = user;
        });
    },
    generateAccesToken(user, privateKey){
        return jwt.sign(user, privateKey, {expiresIn: '30s'});
    }
}

export function error(msg){
    return JSON.stringify({
        "Error":{
            "msg": msg
        }
    })
}