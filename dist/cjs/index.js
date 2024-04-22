"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compression = void 0;
const compressible_1 = __importDefault(require("compressible"));
const elysia_1 = require("elysia");
const stream_1 = require("./stream");
const utils_1 = require("./utils");
const zlib_1 = require("zlib");
const shouldCompress = (res) => {
    const type = res.headers.get('Content-Type');
    if (!type) {
        return false;
    }
    return (0, compressible_1.default)(type) ?? false;
};
const toBuffer = (data, encoding) => Buffer.from(typeof data === 'object'
    ? JSON.stringify(data)
    : data?.toString() ?? new String(data), encoding);
const compression = ({ type = 'gzip', options = {}, encoding = 'utf-8' } = {
    type: 'gzip',
    encoding: 'utf-8',
}) => {
    const app = new elysia_1.Elysia({
        name: 'elysia-compression',
    });
    if (!['gzip', 'deflate'].includes(type)) {
        throw new Error('Invalid compression type. Use gzip or deflate.');
    }
    return app.onAfterHandle(ctx => {
        ctx.set.headers['Content-Encoding'] = type;
        const res = (0, elysia_1.mapResponse)(ctx.response, {
            status: 200,
            headers: {},
        });
        if (!res.headers.get('Content-Type')) {
            res.headers.set('Content-Type', 'text/plain');
        }
        if (!shouldCompress(res)) {
            delete ctx.set.headers['Content-Encoding'];
            return ctx.response;
        }
        const stream = ctx.response?.stream;
        const compressedBody = (0, utils_1.isReadableStream)(stream)
            ? stream.pipeThrough(new stream_1.CompressionStream(type))
            : type === 'gzip'
                ? (0, zlib_1.gzipSync)(toBuffer(ctx.response, encoding), options)
                : (0, zlib_1.deflateSync)(toBuffer(ctx.response, encoding), options);
        ctx.response = new Response(compressedBody, {
            headers: res.headers,
        });
    });
};
exports.compression = compression;
