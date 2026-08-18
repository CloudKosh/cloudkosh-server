import { closeSync, openSync, read, statSync } from "fs";

export abstract class AsyncStream implements Disposable {

    abstract read(n: number): Promise<Buffer>;

    abstract [Symbol.dispose]();

}

const maxBufferSize = 16*1024;

export class AsyncFileStream extends AsyncStream {

    public readonly size: number;

    private fd: any;

    private buffer: Buffer;

    constructor(
        private readonly filePath: string,
        public readPosition = 0,
        lockFile = true,
        bufferSize = maxBufferSize
        ) {
        super();

        if (lockFile) {
            this.fd = openSync(filePath, "r");
        }
        this.buffer = Buffer.alloc(bufferSize);
        const { size } = statSync(filePath);
        this.size = size;
    }

    read(): Promise<Buffer> {

        return new Promise<Buffer>((resolve, reject) => {

            const size = this.size - this.readPosition;

            if (size <= 0) {
                resolve(null);
                return;
            }

            const buffer = (size) > this.buffer.byteLength
                ? this.buffer
                : Buffer.alloc(size);

            this.readPosition += size;

            if (this.fd) {

                read(this.fd, buffer, 0, buffer.byteLength, this.readPosition,
                    (error) => error ? reject(error) : resolve(buffer));
                return;
            }
            const fd = openSync(this.filePath, "r");
            read(this.fd, buffer, 0, buffer.byteLength, this.readPosition,
                (error) => {
                    try {
                        closeSync(fd);
                    } catch (e) {
                        reject(e);
                        return;
                    }
                    if(error ) {
                        reject(error);
                        return;
                    }
                    resolve(buffer);
                });
        });
    }
    [Symbol.dispose]() {
        if (this.fd) {
            closeSync(this.fd);
        }
    }

}