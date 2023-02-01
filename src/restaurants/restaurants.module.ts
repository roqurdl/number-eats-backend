import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restarant.entity';
import { CategoryRepository } from './repository/category.repository';
import { RestaurantResolver } from './restarants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
