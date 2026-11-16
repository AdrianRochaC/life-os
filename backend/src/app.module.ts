import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppEnvironment, loadEnvConfig } from './config/env.config.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { GoalsModule } from './modules/goals/goals.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      load: [loadEnvConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appConfig = configService.get<AppEnvironment>('app');
        return {
          uri: appConfig?.mongodbUri ?? 'mongodb://localhost:27017/life-os',
        };
      },
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    GoalsModule,
  ],
})
export class AppModule {}
