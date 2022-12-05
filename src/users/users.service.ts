import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login-account.dto';
import { Users } from './entities/users.entity';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private readonly users: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ confirm: boolean; error?: string }> {
    try {
      const exist = await this.users.findOne({ where: { email } });
      if (exist) {
        return { confirm: false, error: `This email already used.` };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { confirm: true };
    } catch (e) {
      return { confirm: false, error: `Couldn't create Account.` };
    }
  }
  async login({ email, password }: LoginInput): Promise<{
    confirm: boolean;
    error?: string;
    token?: string;
  }> {
    try {
      const user = await this.users.findOne({ where: { email } });
      if (!user) {
        return { confirm: false, error: `User is not found.` };
      }
      const check = await user.hashCheck(password);
      if (!check) {
        return { confirm: false, error: `You enter the Wrong Password` };
      }
      const token = this.jwtService.sign({ id: user.id });
      return {
        confirm: true,
        token,
      };
    } catch (error) {
      return { confirm: false, error };
    }
  }
}
