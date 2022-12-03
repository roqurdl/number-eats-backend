import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login-account.dto';
import { Users } from './entities/users.entity';
import { UserService } from './users.service';

@Resolver((of) => Users)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}
  @Query((returns) => Boolean)
  hi() {
    return true;
  }
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
        confirm: true,
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
}
