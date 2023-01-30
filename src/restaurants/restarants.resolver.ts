import { Args, Resolver, Mutation } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Users } from 'src/users/entities/users.entity';
import {
  createRestaurantInput,
  createRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restarant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((returns) => createRestaurantOutput)
  async createRestaurant(
    @AuthUser() authUser: Users,
    @Args(`input`) createRestaurantInput: createRestaurantInput,
  ): Promise<createRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }
}
