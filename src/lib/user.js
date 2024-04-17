import bcrypt from 'bcrypt';

export var user = {
    validateUser(database,username, password){
        database.selectDB("BinDB");
        const query = {
            select: 0,
            where: {
                username: username
            }
        }
        const usersFound = database.find("users", query);
        database.unselectDB();
        let res = false;
        if (usersFound.length !== 0){
            res = bcrypt.compareSync(password, usersFound[0].password_hash, function(err, result) {});
        }
        return res;
    },
    newUser(database, username, rights, password){
        let res = "User created.";
        bcrypt.hash(password, 13, function(er, hash){
            if(er){
                res = "Error on creating new user: "+er;
            }else{
                database.selectDB("BinDB");
                database.insert("users", [username , "0", rights, hash])
            }
        });
        return res;
    },
    newPassword(database,username, oldpassword, newPassword){
        let res = "Password Updated.";
        if(validateUser(database, username, oldpassword)){
            bcrypt.hash(newPassword, 10, function(er, hash){
                if(er){
                    res = "Error on updating users password: "+er;
                }else{
                    database.update("users", ["username"], [username], ["token","password_hash"], ["0", hash]);
                }
            });
        }else res = "Invalid user credetials.";
        return res;
    }
}