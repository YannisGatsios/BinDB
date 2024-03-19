import readline from 'readline';
//import { DBpath } from '../bindb.js';
import { login,newUser,newPassword,exitApp,helpUser } from '../lib/user.js';

const argv = process.argv;

//newUser("root", "root123");

var rl = readline.createInterface(process.stdin, process.stdout);

helpUser(argv[2]);
login(argv, rl)

rl._writeToOutput = function _writeToOutput(stringToWrite) {
    if (rl.stdoutMuted)
        rl.output.write("\x1B[2K\x1B[200D"+rl.query+"["+((rl.line.length%2==1)?"=-":"-=")+"]");
    else
        rl.output.write(stringToWrite);
};

export function terminal(){ 
    rl.on('line', (prompt)=>{
        helpUser(prompt);
        var DBname = DBpath.split('/');
        rl.setPrompt('BinDB:> [ '+DBname[DBname.length-1]+' ] U:> [ '+argv[3]+" ] :> ");
        rl.prompt();
        addUser(prompt,rl);
        exitApp(prompt,rl);
    });
}

function addUser(prompt,rl){
    if (prompt == "adduser"){
        rl.question("Give users username : ", (suerName) => {
            rl.stdoutMuted = true;
            rl.query = "Password : ";
            rl.question(rl.query, (userPassword) => {
                rl.query = "Confirm Password : ";
                rl.question(rl.query, (confirmedPassword) => {
                    rl.stdoutMuted = false;
                    if (userPassword == confirmedPassword){
                        rl.question("User Rights : ", (userRights) => {
                            if(userRights == 0 || userRights == 1){
                                newUser(suerName, userPassword, userRights);
                            }else{
                                console.log("You can only give the values of 1 or 0 try typing help!");
                            }
                        });
                    }else{
                        console.log("Passwords are not matching.");
                    }
                });
            });
        });
    }
}

//exitApp("exit",rl);