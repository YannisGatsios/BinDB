<h1>This is a Binary Database.</h1>
<h3>Data is saved in .bin files in RSV format where :</h3>

 - 0xFF corresponds to the end of an element.
 - And 0xFD corresponds to the end of a line.

<h1>These are some of the functions that exists.</h1>
These can be found through the commmands.js file that exists in BinDB/src/commands.js

- select(Database_Name: String) this is for selecting your database.
- createDB(Database_Name: String) this is for creating your database in the default directory that is specified in the config.js.
- newTable(table_Name: String, Configuration: StringArray) creates new table only when there is a database selected,use case :
  - newTable("Users", ["user_name","user_email","password_hash","user_id"]) this will create table named Users where it is required to give a user_name, a user_email, the password_hash and the user_id after every insertion
  - after creating the table there will be created an empty Users.bin file in /DBname/Users.bin and a .Users_index.bin in /DBname/.tablesIndex/.Users_index.bin where the table configuration is saved.

NOTE: there is no auto incremention or fixed buffer seizes these have to be taken care of by the developer.
