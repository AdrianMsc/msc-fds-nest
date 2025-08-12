"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    const start = Date.now();
    console.log(`[Bootstrap] Starting Nest app… NODE_ENV=${process.env.NODE_ENV ?? 'undefined'}`);
    await app.listen(port);
    const listenMs = Date.now() - start;
    try {
        const url = app.getUrl ? await app.getUrl() : `http://localhost:${port}`;
        console.log(`[Bootstrap] App listening on ${url} (port ${port}) in ${listenMs}ms`);
    }
    catch (e) {
        console.log(`[Bootstrap] App started on port ${port} in ${listenMs}ms`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map