import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Transform } from 'node:stream';
import { directoryPath } from '../nwd/index.js';

const cat = async (source) => {
    try {
        const sourceResolve = path.resolve(directoryPath, source); 
        const sourceStat = await fs.promises.stat(sourceResolve);
        
        if (sourceStat.isFile()) {
            fs.createReadStream(sourceResolve).pipe(process.stdout);
        } else {
            console.log(`${JSON.stringify(source)} is not a file`);
        }

    } catch(err) {
        console.log(`File read error ${JSON.stringify(source)}`);
    }
    
}

const add = async (source) => {
    try {
        const ext = path.parse(source).ext;
        const sourceResolve = path.resolve(directoryPath, source);
        
        if (ext) {
            fs.promises.writeFile(sourceResolve, '', { flag: 'w' });
        } else {
            console.log(`Failed create file ${JSON.stringify(source)}`);
        }
    } catch(err) {
        console.log(`Failed create file ${JSON.stringify(source)}`);
    }
};

const copy = async (source, destination) => {
    try {
        const resolveSource = path.resolve(directoryPath, source);
        const resolveDestination = path.resolve(directoryPath, destination);        
        const statSource = await fs.promises.stat(resolveSource);
        const statDestination = await fs.promises.stat(resolveDestination);

        if (statSource.isFile() && statDestination.isDirectory()) {
            const { base } = path.parse(resolveSource);
            const readStream = fs.createReadStream(resolveSource);
            const writeStream = fs.createWriteStream(path.resolve(resolveDestination, base));
            readStream.pipe(writeStream);
        }
    } catch(err) {
        console.log('Failed copy');
    }
};

const move = async (source, destination) => {
    try {
        await copy(source, destination);
        await remove(source);
    } catch(err) {
        console.log('Failed move');
    }
};

const rename = async (source, name) => {
    try {
        const sourceResolve = path.resolve(directoryPath, source);
        const isExistSource = await fs.promises.access(sourceResolve, fs.constants.R_OK);
        if (!isExistSource) {
            fs.promises.rename(sourceResolve, path.resolve(path.parse(sourceResolve).dir, name));
        }
    } catch(err) {
        console.log('Failed rename');
    }
};

const remove = async (source) => {
    try {
        const sourceResolve = path.resolve(directoryPath, source);
        const isExist = await fs.promises.access(sourceResolve, fs.constants.R_OK);
        if (!isExist) {
            fs.promises.rm(sourceResolve);
        }
    } catch(err) {
        console.log(`Failed remove ${JSON.stringify(source)}`);
    }
};

export const fsTransform = new Transform({
    async transform(chunk, encoding, callback) {
        const input = chunk.toString().trim().split(/\s/);
        const [command, source, destination] = input;

        try {
            if (command === 'cat' && input.length === 2) {
                cat(source);
            }
            if (command === 'add' && input.length === 2) {
                add(source);
            }
            if (command === 'rn' && input.length === 3) {
                rename(source, destination);
            }
            if (command === 'mv' && input.length === 3) {
                move(source, destination);
            }
            if (command === 'cp' && input.length === 3) {
                copy(source, destination);
            }
            if (command === 'rm' && input.length === 2) {
                remove(source);
            }
            callback(null, chunk);
        } catch (err) {
            callback(null, 'Failed operation' +  os.EOL);
        }
    }
});