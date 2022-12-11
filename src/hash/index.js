import { EOL } from 'node:os';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { Transform } from 'node:stream';

export const hashTransform = new Transform({
    async transform(chunk, encoding, callback) {
        try {
            const input = chunk.toString().trim();
            if (input.startsWith('hash')) {
                const [ cmd, path, thirty ] = input.split(/\s/);
                if (path && !thirty) {
                    const content = await readFile(resolve(path));
                    const hash = await createHash('sha256').update(content).digest('hex');
                    console.log(hash);
                }
            }            
            callback(null, chunk);
        } catch (err) {
            callback(null, 'Not such file' +  EOL);
        }
    }
});