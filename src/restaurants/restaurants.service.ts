import { Injectable } from '@nestjs/common';
import {
  createRestaurantInput,
  createRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
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
}
