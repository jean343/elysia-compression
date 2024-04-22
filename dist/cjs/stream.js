"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressionStream = void 0;
const node_zlib_1 = __importDefault(require("node:zlib"));
class CompressionStream {
    readable;
    writable;
    constructor(format) {
        const handle = format === 'deflate'
            ? node_zlib_1.default.createDeflate()
            : format === 'gzip'
                ? node_zlib_1.default.createGzip()
                : node_zlib_1.default.createDeflateRaw();
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
exports.CompressionStream = CompressionStream;
