import { Injectable } from '@nestjs/common';
import {
  createRestaurantInput,
  createRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Restaurant } from './entities/restarant.entity';
import { Users } from 'src/users/entities/users.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurants.dto';
import { CategoryRepository } from './repository/category.repository';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurants.dto';
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
import {
  DeleteDishesInput,
  DeleteDishesOutput,
} from './dtos/delete-dishes.dto';
import { EditDishesInput, EditDishesOutput } from './dtos/edit-dishes.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly categories: CategoryRepository,
  ) {}

  async CheckRestaurant(owner: Users, id: number, type: string) {
    const restarant = await this.restaurants.findOneBy({ id });
    if (!restarant) {
      return { ok: false, error: `Restaurant is not found.` };
    }
    if (owner.id !== restarant.ownerId) {
      return {
        ok: false,
        error: `You can not ${type} restarant.`,
      };
    }
  }

  async createRestaurant(
    owner: Users,
    createRestaurantInput: createRestaurantInput,
  ): Promise<createRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: `Could not create Restaurants`,
      };
    }
  }
  async editRestaurant(
    owner: Users,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const dbCheck = await this.CheckRestaurant(
        owner,
        editRestaurantInput.restaurantId,
        `edit`,
      );
      if (!dbCheck) {
        return {
          ok: false,
          error: `There is unknown error in database.`,
        };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: true,
        error: `Could not edit profile.`,
      };
    }
  }
  async deleteRestaurant(
    owner: Users,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const dbCheck = await this.CheckRestaurant(owner, restaurantId, `delete`);
      if (!dbCheck) {
        return {
          ok: false,
          error: `There is unknown error in database.`,
        };
      }
      await this.restaurants.delete(restaurantId);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: `Could not delete Restaurant`,
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return { ok: true, categories: categories };
    } catch {
      return {
        ok: false,
        error: `Could not load categories`,
      };
    }
  }
  countRestaurants(category: Category) {
    return this.restaurants.count({
      where: {
        category: {
          id: category.id,
        },
      },
    });
  }
  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: {
          slug: slug,
        },
      });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      const restaurants = await this.restaurants.find({
        where: { category: { id: category.id } },
        take: 25,
        skip: (page - 1) * 25,
      });
      category.restaurant = restaurants;
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }
  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 25,
        take: 25,
        order: {
          isPromoted: 'DESC',
        },
        relations: ['category'],
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }
  async findRestById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: `There is no Restaurant ID:${restaurantId}`,
        };
      }
      return { ok: true, restaurant };
    } catch {
      return { ok: false, error: `Could not find Restaurant` };
    }
  }
  async findRestByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: ILike(`%${query}%`),
        },
        skip: (page - 1) * 25,
        take: 25,
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch {
      return {
        ok: false,
        error: `Could not search for Restaurants.`,
      };
    }
  }
  async createDish(
    owner: Users,
    createDishInput: CreateDishesInput,
  ): Promise<CreateDishesOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: createDishInput.restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: `There is no Restaurant ID:${createDishInput.restaurantId}`,
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: `You are not owner of this Restaurant`,
        };
      }
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return { ok: true };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }
  async editDish(
    owner: Users,
    editDishInput: EditDishesInput,
  ): Promise<EditDishesOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: editDishInput.dishId },
      });
      if (!dish) {
        return {
          ok: false,
          error: `There is no Dish ID:${editDishInput.dishId}`,
        };
      }
      if (owner.id !== dish.restaurant.ownerId) {
        return {
          ok: false,
          error: `You don't have authority of edit`,
        };
      }
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not edit dish' };
    }
  }
  async deleteDish(
    owner: Users,
    { dishId }: DeleteDishesInput,
  ): Promise<DeleteDishesOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: dishId },
        relations: [`restaurant`],
      });
      if (!dish) {
        return {
          ok: false,
          error: `There is no Dish ID:${dishId}`,
        };
      }
      if (owner.id !== dish.restaurant.ownerId) {
        return {
          ok: false,
          error: `You don't have authority of delete`,
        };
      }
      await this.dishes.delete(dishId);
      return { ok: true };
    } catch {
      return { ok: false, error: `Could not delete` };
    }
  }
}
