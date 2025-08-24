import fp from "fastify-plugin"
import { FastifyPluginAsync } from 'fastify'
import { Container } from "inversify"

declare module "fastify" {
    interface FastifyInstance {
        diContainer: Container
    }
    interface FastifyRequest {
        diScope: Container
    }
}

export interface InversifyPluginOptions {
    container?: Container
    disposeOnClose?: boolean
    disposeOnResponse?: boolean
}

const plugin: FastifyPluginAsync<InversifyPluginOptions> = async (fastify, options) => {
    const container = options.container ?? new Container();
    const disposeOnClose = options.disposeOnClose ?? true;
    const disposeOnResponse = options.disposeOnResponse ?? true;

    fastify.decorate("diContainer", container);
    fastify.decorateRequest("diScope");

    fastify.addHook("onRequest", async (request) => {
        request.diScope = new Container({ parent: container });
    });

    if (disposeOnClose) {
        fastify.addHook('onClose', async (instance) => await instance.diContainer.unbindAll());
    }

    if (disposeOnResponse) {
        fastify.addHook('onResponse', async (request) => await request.diScope.unbindAll());
    }
};

export default fp(plugin, {
    fastify: "5.x",
    name: "@zaubermaerchen/fastify-inversify",
});
