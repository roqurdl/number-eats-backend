import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { Users } from './entities/users.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private readonly users: Repository<Users>,
  ) {}
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<string | undefined> {
    try {
      const exist = await this.users.findOne({ where: { email } });
      if (exist) {
        return `This email already used.`;
      }
      await this.users.save(this.users.create({ email, password, role }));
    } catch (e) {
      return `Couldn't create Account.`;
    }
  }
}
