
const argv = process.argv;
if (argv[2] == "start"){
    import('./Web_Interface/index.js').catch(err => console.error(err));
}
