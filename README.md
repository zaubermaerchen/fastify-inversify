# fastify-inversify
Fastify plugin for [InversifyJS](https://inversify.io/)

## Installation

``` bash
npm install @zaubermaerchen/fastify-inversify
```

## Example

``` typescript
import { fastify } from 'fastify';
import { Container } from 'inversify';
import fastifyInversifyPlugin from '@zaubermaerchen/fastify-inversify';

const app = fastify({ logger: true });

// Create Inversify container
const container = new Container();
container.bind<string>('message').toConstantValue('Hello World');

// Install plugin
app.register(fastifyInversifyPlugin, {
    container
});

app.get('/', async (req) => {
    // Get item from request scope container
    // diScope is diContainer's child container
    const message = req.diScope.get<string>('message');
    return {
        message,
    };
});

app.listen({ port: 8080 }, function (err, address) {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }

    // Get item from application scope container
    const message = app.diContainer.get<string>('message');
    app.log.info(message);
});
```

## Plugin Options
### container

Set Inversify Container instance.
If omitted, an empty container will be set.

### disposeOnClose

If set `true`, remove all bindings binded in diContainer at `onClose` event.
Default value is `true`

### disposeOnResponse

If set `true`, remove all bindings binded in diScope at `onResponse` event.
Default value is `true`
