import { CommandFactory } from 'nest-commander';

import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Load the NestJS application context (modules, services, etc.)
  //    but DO NOT start it as an HTTP server.
  await CommandFactory.run(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
}
bootstrap();
