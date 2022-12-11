import os from 'node:os';
import { Transform } from 'node:stream';

const getCpus = () => os.cpus().map(({ model, speed }) => ({ model, speed }));

export const osTransform = new Transform({
    transform(chunk, encoding, callback) {
        try {
            switch(chunk.toString().trim()) {
                case 'os --EOL':
                    console.log(JSON.stringify(os.EOL));
                    break;
                case 'os --cpus':
                    console.table(getCpus());
                    break;
                case 'os --homedir':
                    console.log(os.homedir());
                    break;
                case 'os --username':
                    console.log(os.userInfo().username);
                    break;
                case 'os --architecture':
                    console.log(os.arch())
                    break;
                default:
            }
            callback(null, chunk);
        } catch (err) {
            callback(err);
        }
    }
});
