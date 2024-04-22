import compressible from 'compressible';
import { Elysia, mapResponse } from 'elysia';
import { CompressionStream } from './stream';
import { isReadableStream } from './utils';
import { deflateSync, gzipSync } from 'zlib';
const shouldCompress = (res) => {
    const type = res.headers.get('Content-Type');
    if (!type) {
        return false;
    }
    return compressible(type) ?? false;
};
const toBuffer = (data, encoding) => Buffer.from(typeof data === 'object'
    ? JSON.stringify(data)
    : data?.toString() ?? new String(data), encoding);
export const compression = ({ type = 'gzip', options = {}, encoding = 'utf-8' } = {
    type: 'gzip',
    encoding: 'utf-8',
}) => {
    const app = new Elysia({
        name: 'elysia-compression',
    });
    if (!['gzip', 'deflate'].includes(type)) {
        throw new Error('Invalid compression type. Use gzip or deflate.');
    }
    return app.onAfterHandle(ctx => {
        ctx.set.headers['Content-Encoding'] = type;
        const res = mapResponse(ctx.response, {
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
        const compressedBody = isReadableStream(stream)
            ? stream.pipeThrough(new CompressionStream(type))
            : type === 'gzip'
                ? gzipSync(toBuffer(ctx.response, encoding), options)
                : deflateSync(toBuffer(ctx.response, encoding), options);
        ctx.response = new Response(compressedBody, {
            headers: res.headers,
        });
    });
};
