import zlib from 'node:zlib';
export class CompressionStream {
    readable;
    writable;
    constructor(format) {
        const handle = format === 'deflate'
            ? zlib.createDeflate()
            : format === 'gzip'
                ? zlib.createGzip()
                : zlib.createDeflateRaw();
        this.readable = new ReadableStream({
            start(controller) {
                handle.on('data', (chunk) => controller.enqueue(chunk));
                handle.once('end', () => controller.close());
            },
        });
        this.writable = new WritableStream({
            write: (chunk) => handle.write(chunk),
            close: () => handle.end(),
        });
    }
}
