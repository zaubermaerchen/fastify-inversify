import assert from 'node:assert';
import test from 'node:test';
import { fastify } from 'fastify';
import { Container } from 'inversify';
import fastifyInversifyPlugin from '../src/plugin.js';

const defaultKey = 'CONSTANT';
const defaultValue = 'Default';

function createContainer() {
    const container = new Container();
    container.bind<string>(defaultKey).toConstantValue(defaultValue);
    return container;
}

test('コンテナにセットした値にアクセスできるか', async (t) => {
    const app = fastify({ logger: true });
    app.register(fastifyInversifyPlugin, {
        container: createContainer(),
    });

    app.post('/', async (req, res) => {
        res.send({
            diContainer: app.diContainer.get<string>(defaultKey),
            diScope: req.diScope.get<string>(defaultKey),
        });
    })
    await app.ready();

    const response = await app.inject().post('/').end();

    assert.strictEqual(response.statusCode, 200);
    const responseBody = JSON.parse(response.body);
    assert.strictEqual(responseBody.diContainer, defaultValue);
    assert.strictEqual(responseBody.diScope, defaultValue);

    await app.close();
});

test('diScope側でコンテナにセットした値を上書きした場合、diContainer側には影響が出ないか', async (t) => {
    const app = fastify({ logger: true });
    app.register(fastifyInversifyPlugin, {
        container: createContainer(),
    });

    app.post('/', async (req, res) => {
        req.diScope.bind<string>(defaultKey).toConstantValue('value2');

        res.send({
            diContainer: app.diContainer.get<string>(defaultKey),
            diScope: req.diScope.get<string>(defaultKey),
        });
    })
    await app.ready();

    const response = await app.inject().post('/').end();

    assert.strictEqual(response.statusCode, 200);
    const responseBody = JSON.parse(response.body);
    assert.strictEqual(responseBody.diContainer, defaultValue);
    assert.strictEqual(responseBody.diScope, 'value2');

    await app.close();
});

test('オプション指定なしの場合でも正常に動作するか', async (t) => {
    const app = fastify({ logger: true });
    app.register(fastifyInversifyPlugin);

    app.post('/', async (req, res) => {
        app.diContainer.bind<string>(defaultKey).toConstantValue(defaultValue);

        res.send({
            diContainer: app.diContainer.get<string>(defaultKey),
            diScope: req.diScope.get<string>(defaultKey),
        });
    })
    await app.ready();

    const response = await app.inject().post('/').end();

    assert.strictEqual(response.statusCode, 200);
    const responseBody = JSON.parse(response.body);
    assert.strictEqual(responseBody.diContainer, defaultValue);
    assert.strictEqual(responseBody.diScope, defaultValue);

    await app.close();
});

test('disposeOnClose/disposeOnResponseがfalseの場合でも正常に動作するか', async (t) => {
    const app = fastify({ logger: true });
    app.register(fastifyInversifyPlugin, {
        container: createContainer(),
        disposeOnClose: false,
        disposeOnResponse: false,
    });

    app.post('/', async (req, res) => {
        res.send({
            diContainer: app.diContainer.get<string>(defaultKey),
            diScope: req.diScope.get<string>(defaultKey),
        });
    })
    await app.ready();

    const response = await app.inject().post('/').end();

    assert.strictEqual(response.statusCode, 200);
    const responseBody = JSON.parse(response.body);
    assert.strictEqual(responseBody.diContainer, defaultValue);
    assert.strictEqual(responseBody.diScope, defaultValue);

    await app.close();
});
