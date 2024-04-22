/// <reference types="bun-types" />
export declare class CompressionStream {
    readable: ReadableStream;
    writable: WritableStream;
    constructor(format: 'gzip' | 'deflate');
}
