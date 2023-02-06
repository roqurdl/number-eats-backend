import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restarant.entity';
import { CategoryRepository } from './repository/category.repository';
import { TypeOrmExModule } from './repository/typeorm-ex.module';
import {
  CatergoryResolver,
  DishResolver,
  RestaurantResolver,
} from './restarants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, Category, Dish]),
    TypeOrmExModule.forCustomRepository([CategoryRepository]),
  ],
  providers: [
    RestaurantResolver,
    CatergoryResolver,
    RestaurantService,
    DishResolver,
  ],
})
export class RestaurantsModule {}
