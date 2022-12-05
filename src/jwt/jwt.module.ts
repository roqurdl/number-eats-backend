import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTION } from './jwt.constant';
import { JwtModuleOptions } from './jwt.interface';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      exports: [JwtService],
      providers: [{ provide: CONFIG_OPTION, useValue: options }, JwtService],
    };
  }
}
