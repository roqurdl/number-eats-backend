import {
  Args,
  Resolver,
  Mutation,
  Query,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { Users } from 'src/users/entities/users.entity';
import {
  createRestaurantInput,
  createRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurants.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurants.dto';
import { Restaurant } from './entities/restarant.entity';
import { RestaurantService } from './restaurants.service';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/all-category.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Dish } from './entities/dish.entity';
import {
  CreateDishesInput,
  CreateDishesOutput,
} from './dtos/create-dishes.dto';
import { EditDishesInput, EditDishesOutput } from './dtos/edit-dishes.dto';
import {
  DeleteDishesInput,
  DeleteDishesOutput,
} from './dtos/delete-dishes.dto';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((returns) => createRestaurantOutput)
  @Role([`Owner`])
  async createRestaurant(
    @AuthUser() authUser: Users,
    @Args(`input`) createRestaurantInput: createRestaurantInput,
  ): Promise<createRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Mutation((returns) => EditRestaurantOutput)
  @Role([`Owner`])
  async editRestaurant(
    @AuthUser() owner: Users,
    @Args(`input`) editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation((returns) => DeleteRestaurantOutput)
  @Role([`Owner`])
  async deleteRestaurant(
    @AuthUser() owner: Users,
    @Args(`input`) deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }
}
@Resolver((of) => Category)
export class CatergoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField((type) => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  @Query((type) => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query((type) => CategoryOutput)
  category(
    @Args(`input`) categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
  @Query((returns) => RestaurantsOutput)
  restaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query((returns) => RestaurantOutput)
  restaurant(
    @Args(`input`) restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.findRestById(restaurantInput);
  }

  @Query((returns) => SearchRestaurantOutput)
  searchRestaurant(
    searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.findRestByName(searchRestaurantInput);
  }
}
@Resolver((of) => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((type) => CreateDishesOutput)
  @Role([`Owner`])
  createDish(
    @AuthUser() owner: Users,
    @Args(`input`) createDishInput: CreateDishesInput,
  ): Promise<CreateDishesOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation((type) => EditDishesOutput)
  @Role([`Owner`])
  editDish(
    @AuthUser() owner: Users,
    @Args(`input`) editDishInput: EditDishesInput,
  ): Promise<EditDishesOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation((type) => DeleteDishesOutput)
  @Role([`Owner`])
  CreateDish(
    @AuthUser() owner: Users,
    @Args(`input`) deleteDishInput: DeleteDishesInput,
  ): Promise<DeleteDishesOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}
