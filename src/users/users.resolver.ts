import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
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
      const error = await this.usersService.createAccount(createAccountInput);
      if (error) {
        return { error, confirm: true };
      }
      return {
        confirm: true,
      };
    } catch (error) {
      return {
        error,
        confirm: false,
      };
    }
  }
}