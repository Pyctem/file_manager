import { pipeline } from 'node:stream';
import { stdin, stdout } from 'node:process';
import { osTransform } from './os/index.js';
import { fsTransform } from './fs/index.js';
import { nwdTransform } from "./nwd/index.js";
import { hashTransform } from './hash/index.js';
import { compressTransform } from './compress/index.js'
import { printGreeting, printParting, printPath, directoryTransform } from "./greetings/index.js";

printGreeting();
printPath();

pipeline(
    stdin, 
    osTransform, 
    fsTransform, 
    nwdTransform, 
    hashTransform, 
    compressTransform, 
    directoryTransform, 
    stdout,
    (err) => {
        if (err) {
            console.error('Pipeline failed.', err);
        }
    }
  );

process.on('SIGINT', (code) => {
    printParting()
    process.exit(code);
});

process.on('exit', (code) => {
    printParting()
    process.exit(code);
});