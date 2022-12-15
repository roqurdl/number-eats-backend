import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login-account.dto';
import { Users } from './entities/users.entity';
import { UserService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth-user.decorator';

@Resolver((of) => Users)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}
  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const { confirm, error } = await this.usersService.createAccount(
        createAccountInput,
      );
      return {
        confirm,
        error,
      };
    } catch (error) {
      return {
        error,
        confirm: false,
      };
    }
  }
  @Mutation((returns) => LoginOutput)
  async login(@Args(`input`) loginInput: LoginInput): Promise<LoginOutput> {
    try {
      const { confirm, error, token } = await this.usersService.login(
        loginInput,
      );
      return {
        confirm,
        error,
        token,
      };
    } catch (error) {
      return {
        error,
        confirm: false,
      };
    }
  }
  @Query((returns) => Users)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser) {
    return authUser;
  }
}
