import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interface';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { CONFIG_OPTION } from 'src/common/common.constant';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTION) private readonly options: JwtModuleOptions,
    private readonly config: ConfigService,
  ) {}
  sign(payload: object) {
    console.log(payload);
    return jwt.sign(payload, this.config.get(`PRIVATE_KEY`));
  }
  verifyToken(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
