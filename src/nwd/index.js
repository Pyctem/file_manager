import os from 'node:os';
import path from 'node:path';
import { Transform } from 'node:stream';
import { readdir, stat } from 'node:fs/promises';

export const rootPath = path.parse(process.cwd()).root;
export let directoryPath = os.homedir();

const getUp = () => {
    if (directoryPath !== rootPath) {
        return directoryPath = path.resolve(directoryPath, '..');
    };
    return directoryPath;
}

const getLs = async () => {
    const directoryContent = await readdir(directoryPath);
    return Promise.all(directoryContent.map(getFileOrDirectoryInfo));
}

const setDirectory = async (value) => {
    const newPpath = path.resolve(directoryPath, value);
    const pathStat = await stat(newPpath);
    if (pathStat.isDirectory()) {
        directoryPath = newPpath;
    }
}

const getFileOrDirectoryInfo = async (name) => {
    try {
        const stats = await stat(path.join(directoryPath, path.sep, name));
        const type = (stats.isDirectory() && 'directory') || 'file';
        return { name, type };
    } catch(err) {
        console.log(err);
    }
}

export const nwdTransform = new Transform({
    async transform(chunk, encoding, callback) {
        const input = chunk.toString().trim().split(/\s/);
        const [command, source] = input;
        try {
            if (command === 'ls' && input.length === 1) {
                const contetnt = await getLs();
                console.table(contetnt);
            }
            if (command === 'up' && input.length === 1) {
                await getUp();
            }
            if (command === 'cd' && input.length === 2) {
                await setDirectory(source);
            }
            callback(null, chunk);
        } catch (err) {
            callback(null, 'Not such path' +  EOL);
        }
    }
});