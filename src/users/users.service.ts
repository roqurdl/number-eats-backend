import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login-account.dto';
import { Users } from './entities/users.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verfiy-email.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private readonly users: Repository<Users>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {}
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exist = await this.users.findOne({ where: { email } });
      if (exist) {
        return { ok: false, error: `This email already used.` };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, error: `Couldn't create Account.` };
    }
  }
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['password'],
      });
      if (!user) {
        return { ok: false, error: `User is not found.` };
      }
      const pwCheck = await user.hashCheck(password);
      if (!pwCheck) {
        return { ok: false, error: `You enter the Wrong Password` };
      }
      const token = this.jwtService.sign({ id: user.id });
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }
  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneBy({ id });
      if (!user) {
        throw Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (e) {
      return {
        ok: false,
        error: `There is no User Id: ${id}`,
      };
    }
  }
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    const user = await this.users.findOneBy({ id: userId });
    try {
      if (email) {
        user.email = email;
        user.verified = false;
        await this.verifications.save(this.verifications.create({ user }));
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'],
      });
      if (verification) {
        verification.user.verified = true;
        console.log(verification.user);
        this.users.save(verification.user);
        return {
          ok: true,
        };
      }
      return { ok: false, error: 'Verification not found.' };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
