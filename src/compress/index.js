import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path'
import zlib from 'node:zlib';
import { Transform } from 'node:stream';
import { directoryPath } from '../nwd/index.js';

const compress = async (source, destination) => {
    const sourcePath = path.resolve(directoryPath, source);
    const destinationPath = path.resolve(directoryPath, destination);
    const isExistSource = await fs.promises.access(sourcePath, fs.constants.R_OK);
    const isExistDestination = await fs.promises.access(destinationPath, fs.constants.W_OK);
    if (!isExistSource && !isExistDestination) {
        const { base } = path.parse(sourcePath);
        const readStream = fs.createReadStream(sourcePath);
        const writeStream = fs.createWriteStream(path.resolve(destinationPath,  base + '.br'));
        const brotli = zlib.createBrotliCompress();
    
        await readStream.pipe(brotli).pipe(writeStream);

        return true
    }

    return false;
}

const decompress = async (source, destination) => {
    const sourcePath = path.resolve(directoryPath, source);
    const destinationPath = path.resolve(directoryPath, destination);
    const isExistSource = await fs.promises.access(sourcePath, fs.constants.R_OK);
    const isExistDestination = await fs.promises.access(destinationPath, fs.constants.W_OK);
    if (!isExistSource && !isExistDestination) {
        const { base, ext } = path.parse(sourcePath);
        if (ext === '.br') {
            const readStream = fs.createReadStream(sourcePath);
            const writeStream = fs.createWriteStream(path.resolve(destinationPath, base.replace('.br', '')));
            const brotli = zlib.createBrotliDecompress();
        
            await readStream.pipe(brotli).pipe(writeStream);

            return true;
        }
    }
    
    return false;
}

export const compressTransform = new Transform({
    async transform(chunk, encoding, callback) {
        const input = chunk.toString().trim();
        try {
            if (input.startsWith('compress')) {
                const [command, pathFile, pathDestination] = input.split(/\s/);
                if (pathFile && pathDestination) {
                    const isCompleted = await compress(pathFile.trim(), pathDestination.trim());
                    if (isCompleted) {
                        console.log('Compress completed');
                    } else {
                        console.log('Compress failed')
                    }
                }
            }
            if (input.startsWith('decompress')) {
                const [command, pathFile, pathDestination] = input.split(/\s/);
                if (pathFile, pathDestination) {
                    const isCompleted = await decompress(pathFile.trim(), pathDestination.trim());
                    if (isCompleted) {
                        console.log('Decompress completed');
                    } else {
                        console.log('Decompress failed')
                    }
                }
            }
            callback(null, chunk);
        } catch (err) {
            callback(null, 'Failed operation' +  os.EOL);
        }
    }
});