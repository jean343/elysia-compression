/// <reference types="bun-types" />
import { Elysia } from 'elysia';
import { BrotliOptions } from 'zlib';
export type CompressionOptions = {
    type: 'gzip' | 'deflate';
    options?: BrotliOptions;
    encoding?: BufferEncoding;
};
export declare const compression: ({ type, options, encoding }?: CompressionOptions) => Elysia<"", {
    request: {};
    store: {};
}, {
    type: {};
    error: {};
}, {}, {}, false>;
