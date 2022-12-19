import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login-account.dto';
import { Users } from './entities/users.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';

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
  }: CreateAccountInput): Promise<{ confirm: boolean; error?: string }> {
    try {
      const exist = await this.users.findOne({ where: { email } });
      if (exist) {
        return { confirm: false, error: `This email already used.` };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
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
      const user = await this.users.findOne({
        where: { email },
        select: ['password'],
      });
      if (!user) {
        return { confirm: false, error: `User is not found.` };
      }
      const pwCheck = await user.hashCheck(password);
      if (!pwCheck) {
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
  async findById(id: number): Promise<Users> {
    return this.users.findOneBy({ id });
  }
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<Users> {
    const user = await this.findById(userId);
    if (email) {
      user.email = email;
      user.verified = false;
      await this.verifications.save(this.verifications.create({ user }));
    }
    if (password) {
      user.password = password;
    }
    return this.users.save(user);
  }

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'],
      });
      if (verification) {
        verification.user.verified = true;
        console.log(verification.user);
        this.users.save(verification.user);
        return true;
      }
      throw new Error();
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
