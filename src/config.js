export class bindbconfig {
    constructor() {
        //The path where all your bases are
        this.DefaultDBpath = '../Databases/';
        //This is the database automatically selected
        this.DefaultDB = "BIN_DATABASE";
        //This is the defaulte table for the BinDB users for exaple root user and password are here
        this.DefaultUsersTable = "Users"
        
        //default port
        this.port = 8080;
        //declaring host variable
        this.host;
        //hostlink
        this.hostlink = "http://"+this.host+":";
        
        //the ending value for an element
        this.NEXT_ELEMENT = 0xFF;
        //the ending of a row
        this.NEXT_ROW = 0xFD;

        //Root access users to BinDB
        this.rootUsers = ["root"];
    }
}
