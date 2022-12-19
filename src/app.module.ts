/**
 *JSModule about explain Schema and Validation tool
 */
import * as Joi from 'joi';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';

//Entities
import { Users } from './users/entities/users.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === `dev` ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === `prod`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid(`dev`, `prod`).required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      // Is Option that TypeOrm find entity and migration itself
      synchronize: process.env.NODE_ENV === `prod`,
      logging: true,
      entities: [Users, Verification],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req }) => ({ user: req['user'] }),
      autoSchemaFile: true,
      sortSchema: true,
    }),
    JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: `/graphql`, method: RequestMethod.POST });
  }
}
