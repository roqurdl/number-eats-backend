/**
 *JSModule about explain Schema and Validation tool
 */
import * as Joi from 'joi';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

//Entities
import { Users } from './users/entities/users.entity';
import { JwtModule } from './jwt/jwt.module';
import { Verification } from './users/entities/verification.entity';
import { EmailModule } from './email/email.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Restaurant } from './restaurants/entities/restarant.entity';
import { Category } from './restaurants/entities/category.entity';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-items.entity';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === `dev` ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === `prod`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid(`dev`, `prod`, `test`).required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
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
      synchronize: true,
      logging: true,
      entities: [
        Users,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
      ],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      context: ({ req, connection }) => {
        const TOKEN_KEY = 'x-jwt';
        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY],
        };
      },
      autoSchemaFile: true,
      sortSchema: true,
    }),
    JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }),
    EmailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
