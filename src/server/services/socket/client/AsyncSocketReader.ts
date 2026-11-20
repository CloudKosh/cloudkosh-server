import { Socket } from 'net';
import TimeoutError from '../../../../common/errors/TimeoutError.js';
// import SimpleQueue from '../../core/SimpleQueue.js';

interface IAsyncSocketReaderOptions {
  timeout?: number;
  encoding?: BufferEncoding;
}

class AsyncSocketReader {
  // private bufferQueue = new SimpleQueue<Buffer>();
  private iterator: AsyncIterator<Buffer>;

  private readonly peek: Buffer;

  private _onTimeout;

  private _pendingReject;

  constructor(
    public readonly socket: Socket) {

    // Create async iterator from socket
    this.iterator = socket[Symbol.asyncIterator]();
    this._onTimeout = () => {
        const e = new TimeoutError("Socket timedout");
        try {
            this._pendingReject?.(e);
        } catch {
            // do nothing...
        }
        try {
            this.socket.destroy(e);
        } catch {
            // do nothing..
        }
        this.iterator = void 0;
    };

    socket.on("error", (e) => {
        e ??= new Error("Socket error");
        try {
            this._pendingReject?.(e);
        } catch {
            // do nothing...
        }
        try {
            this.socket.destroy(e);
        } catch {
            // do nothing.
        }
        this.iterator = void 0;
    });
    socket.on("timeout", this._onTimeout);
  }

  
//   /**
//    * Read a line ending with '\n', does not include '\n'
//    */
//   async readLineTillLF(encoding = "ascii" as BufferEncoding, signal?: AbortSignal) {
//     let lineBuffer: Buffer;

//     for(;;) {
//         if (!this.peek) {
//             const next = await this.next(signal);
//             if (next.done) {
//                 throw new Error("Socket closed");
//             }
//             this.setPeek(next.value);
//         }
//         const peek = this.peek;

//         let index = peek.indexOf(10);
//         if (index === -1) {
//             lineBuffer = lineBuffer
//                 ? Buffer.concat([lineBuffer, peek])
//                 : peek;

//             this.setPeek(void 0);
//             continue;
//         }
//         // ended by \n?
//         if((index + 1) === peek.length) {
//             this.setPeek(void 0);
//             lineBuffer = lineBuffer
//                 ? Buffer.concat([lineBuffer, peek.subarray(0, index)])
//                 : peek.subarray(0, index);
//         } else {
//             // in the middle...
//             // we need to put back the remaining
//             lineBuffer = lineBuffer
//                 ? Buffer.concat([lineBuffer, peek.subarray(0, index)])
//                 : peek.subarray(0, index);
//             this.setPeek(peek.subarray(index + 1));
//         }
//         break;
//     }
//     return lineBuffer.toString(encoding);
//   }


  /**
   * Read a line ending with `\r\n`, does not include `\r\n`
   */
  async readLineTillCRLF(encoding = "ascii" as BufferEncoding, signal?: AbortSignal) {
    let lineBuffer: Buffer;

    // \r\n ASCII
    const sep = Buffer.from([13, 10]);

    for(;;) {
        if (!this.peek) {
            const next = await this.next(signal);
            if (next.done) {
                throw new Error("Socket closed");
            }
            this.setPeek(next.value);
        }
        const peek = this.peek;

        // lets handle broken new line first...
        if (lineBuffer?.length > 0 && lineBuffer.at(-1) === 13 && peek.at(0) === 10) {
            this.setPeek(peek.length === 1 ? void 0 : peek.subarray(1));
            return lineBuffer.toString(encoding, 0, lineBuffer.length-1);
        }

        let index = peek.indexOf(sep, "ascii");
        if (index === -1) {
            lineBuffer = lineBuffer
                ? Buffer.concat([lineBuffer, peek])
                : peek;

            this.setPeek(void 0);
            continue;
        }
        // ended by \r\n?
        if((index + 2) === peek.length) {
            this.setPeek(void 0);
            lineBuffer = lineBuffer
                ? Buffer.concat([lineBuffer, peek.subarray(0, index)])
                : peek.subarray(0, index);
        } else {
            // in the middle...
            // we need to put back the remaining
            lineBuffer = lineBuffer
                ? Buffer.concat([lineBuffer, peek.subarray(0, index)])
                : peek.subarray(0, index);
            this.setPeek(peek.subarray(index + 2));
        }
        break;
    }
    return lineBuffer.toString(encoding);
  }

  /**
   * Read specific number of bytes
   */
  async readBytes(length: number, signal?: AbortSignal): Promise<Buffer> {
    if (length <= 0) {
      throw new Error('Length must be positive');
    }

    const resultBuffer = [];

    for(;;) {
        if (!this.peek) {
            const next = await this.next(signal);
            if (next.done) {
                throw new Error("Socket closed");
            }
            this.setPeek(next.value);
        }
        const peek = this.peek;
        if (peek.length < length) {
            this.setPeek(void 0);
            length -= peek.length;
            resultBuffer.push(peek);
            continue;
        }
        if (peek.length === length) {
            this.setPeek(void 0);
            resultBuffer.push(peek);
        } else {
            resultBuffer.push(peek.subarray(0, length));
            this.setPeek(peek.subarray(length));
        }
        break;
    }
    return Buffer.concat(resultBuffer);
  }

  /**
   * Close the reader and underlying socket
   */
  close() {
    try {
        this._pendingReject?.(new Error("close"));
        this.iterator = void 0;
        this.socket.off("timeout", this._onTimeout);
    } catch {
        //
    }
  }

  private next(signal?: AbortSignal) {
    if (!this.iterator) {
        throw new Error("Socket closed");
    }
    return new Promise<IteratorResult<Buffer>>((resolve, reject) => {
        this._pendingReject = (e) => {
            this.iterator = void 0;
            reject(e);
        };
        const p = this.iterator.next({ signal });
        p.then((r) => {
            this._pendingReject = void 0;
            resolve(r);
        },
        (e) => {
            this._pendingReject = void 0;
            reject(e);
        }
    )
    });
  }

  private setPeek(b: Buffer) {
    if (!b || b.length === 0) {
        // @ts-expect-error readonly
        this.peek = void 0;
        return;
    }
    // @ts-expect-error readonly
    this.peek = b;
  }

}

export { AsyncSocketReader, IAsyncSocketReaderOptions as AsyncSocketReaderOptions };