import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { user } from '../lib/user.js';

export var auth = {
    login(db , req, res){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            const jsonData = JSON.parse(data);
            if(!jsonData["username"] || !jsonData["password"]) return res.end(error("Missing credentials."));

            if(user.validateUser(db,jsonData.username,jsonData.password)){
                const user = {username: jsonData.username}
                const accesKey = crypto.randomBytes(64).toString('hex');
                const accesToken = this.newToken(user, accesKey);

                db.selectDB("BinDB");
                const query = {
                    where: {
                        username: jsonData.username
                    },
                    update: {
                        token: accesKey
                    }
                }
                db.update("users", query);
                db.unselectDB();

                res.setHeader('authorization', accesToken);
                return res.end(JSON.stringify({status: "success"}));
            }
            return res.end(error("Invalid login credetials."));
        });
    },
    token(db, req, res){
        let data = "";
        req.on('data', (chunk) => {
            data += chunk;
        });

        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            this.authenticateToken(db,req, res);
            
            if(res.statusCode === 200){
                const accesKey = crypto.randomBytes(64).toString('hex');
                const user = {username: req.user.username};
                const accesToken = this.newToken(user, accesKey);

                db.selectDB("BinDB")
                db.update("users",["username"],[req.user.username],["token"],[accesKey]);
                db.unselectDB();

                res.setHeader('authorization', accesToken);
                return res.end(JSON.stringify({status: "success"}));
            }
            return res.end(error("invelid authorization credetials."));
        });
    },
    authenticateToken(db, req, res){
        const token = req.headers['authorization'];
        if(token === null || token.split(".").length !== 3) {
            return res.statusCode = 401;
        }

        const username = this.parseJwt(token);
        db.selectDB("BinDB");
        const accesKey = db.find("users",["token"],["username"],[username])[1][0][0];
        db.unselectDB();

        jwt.verify(token, accesKey, (err,user) => {
            if(err) return res.statusCode = 403;
            req.user = user;
            return res.statusCode = 200;
        });
    },
    newToken(user, privateKey){
        return jwt.sign(user, privateKey, {expiresIn: '30m'});
    },
    parseJwt(token) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).username;
    }
}

export function error(msg){
    return JSON.stringify({
        "status":{
            "Error":{
                "msg": msg
            }
        }
    })
}