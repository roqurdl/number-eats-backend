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
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';

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
        ok: confirm,
        error,
      };
    } catch (error) {
      return {
        error,
        ok: false,
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
        ok: confirm,
        error,
        token,
      };
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }

  @Query((returns) => Users)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser) {
    return authUser;
  }

  @Query((returns) => UserProfileOutput)
  async userProfile(@Args() userProfileInput: UserProfileInput) {
    try {
      const user = await this.usersService.findById(userProfileInput.userId);
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
        error: `There is no User Id: ${userProfileInput.userId}`,
      };
    }
  }
}
