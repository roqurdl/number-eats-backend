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
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verfiy-email.dto';

@Resolver((of) => Users)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    const { ok, error } = await this.usersService.createAccount(
      createAccountInput,
    );
    return { ok, error };
  }

  @Mutation((returns) => LoginOutput)
  async login(@Args(`input`) loginInput: LoginInput): Promise<LoginOutput> {
    const { ok, error, token } = await this.usersService.login(loginInput);
    return { ok, error, token };
  }

  @Query((returns) => Users)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser) {
    return authUser;
  }

  @Query((returns) => UserProfileOutput)
  async userProfile(@Args() userProfileInput: UserProfileInput) {
    const { ok, error, user } = await this.usersService.findById(
      userProfileInput.userId,
    );
    return { ok, error, user };
  }

  @Mutation((returns) => EditProfileOutput)
  @UseGuards(AuthGuard)
  async editProfile(
    @AuthUser() authUser: Users,
    @Args('input') editProfileInput: EditProfileInput,
  ) {
    return await this.usersService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation((returns) => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') { code }: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    const { ok, error } = await this.usersService.verifyEmail(code);
    return { ok, error };
  }
}
