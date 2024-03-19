import { terminal } from '../Terminal/terminal.js'
import bcrypt from 'bcrypt';//Used for hashing
import { bindbconfig } from '../config.js';

const conf = new bindbconfig();
const DefaultUsersTable = conf.DefaultUsersTable;

export function validateUser(databse,username, password){
    const matchingUsernames = databse.findWhere(DefaultUsersTable, 'user_name', username);
    var res = false; 
    if (matchingUsernames[0] != null){
        res = bcrypt.compareSync(password, matchingUsernames[0][0][2], function(err, result) {});
    }
    return res;
}

export function newPassword(database,username, oldpassword, newPassword){
    if(validateUser(username, oldpassword)){
        bcrypt.hash(newPassword, 10, function(er, hash){
            database.update(DefaultUsersTable, "password", hash, username, 'user_name');
            return "\nPassword Updated!\n";
        });
    }else{return "\nInvalid Password!\n";}
}

export function newUser(database,username, password, rights){
    bcrypt.hash(password, 13, function(er, hash){
        database.insert(database.DBpath, DefaultUsersTable, [username, rights, hash]);
    });
}

export function helpUser(prompt){
    if (prompt == "help"){
        const str = "\n1 exit : will exit your programm.\n"+
                    "\n2 adduser : will add new user, requres[ user name , password , users right ]."+
                    "\n    user rights :\n        * 0 for admin rights.\n        * 1 for basic editing rights.\n"+
                    "\n3 config : To see the constents type :\n    Configuration file exists in [ BinDB/src/config.js ].\n";
        console.log(str);
    }
}

export function login(datatbase,argv, rl){
    if (argv[2] == '-u'){
        console.log("Username : "+argv[3]);
        if (argv[4] == '-p'){
            rl.stdoutMuted = true;
            rl.query = "Password : ";
            rl.question(rl.query, (password) => {
                if(validateUser(datatbase,argv[3], password)){
                    console.log("\nWelcome "+argv[3]+" to BinDB!!!");
                    rl.stdoutMuted = false;
                    var DBname = datatbase.DBpath.split('/');
                    rl.setPrompt('BinDB:> [ '+DBname[DBname.length-1]+' ] U:> [ '+argv[3]+" ] :> ");
                    rl.prompt();
                    terminal();
                }else{
                    console.log("\n!== Wrong Password or Usename,Try again ==!\n");
                    rl.close();
                }
            });
        }
    }
}

export function exitApp(prompt,rl){
    if (prompt == "exit"){
        console.log("Goodbey");
        rl.close();
    }
}