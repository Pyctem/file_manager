import os from 'node:os';
import stream from 'node:stream';
import { directoryPath } from '../nwd/index.js';

const args = process.argv.slice(2).find(arg => arg.startsWith('--username'));
const name = args?.split('=')[1] ?? 'Guest';

export const printGreeting = () => {
    print('Welcome to the File Manager, ' + name + '!');
}

export const printParting = () => {
    print('Thank you for using File Manager, ' + name + ', goodbye!');
}

export const printPath = () => {
    print('You are currently in ' + directoryPath)
}

export const print = (message) => {
    process.stdout.write(message + os.EOL);
}

export const directoryTransform = new stream.Transform({
    async transform(chunk, encoding, callback) {
        const input = chunk.toString().trim();
        if (input.startsWith('.exit')) {
            process.exit();
        }
        callback(null, 'You are currently in ' + directoryPath + os.EOL);
    }
});