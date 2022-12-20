import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTION } from 'src/common/common.constant';
import { EmailModuleOptions } from './email.interface';
import { EmailService } from './email.service';

@Module({})
@Global()
export class EmailModule {
  static forRoot(options: EmailModuleOptions): DynamicModule {
    return {
      module: EmailModule,
      providers: [
        {
          provide: CONFIG_OPTION,
          useValue: options,
        },
        EmailService,
      ],
      exports: [EmailService],
    };
  }
}
