import bcrypt from 'bcrypt';//Used for hashing
import { bindbconfig } from '../config.js';

const conf = new bindbconfig();
const DefaultUsersTable = conf.DefaultUsersTable;

export function validateUser(database,username, password){
    const matchingUsernames = database.findWhere("Users", "*", ['user_name'], [username]);
    var res = false; 
    if (matchingUsernames[0] != null){
        res = bcrypt.compareSync(password, matchingUsernames[1][0][2], function(err, result) {});
    }
    return res;
}