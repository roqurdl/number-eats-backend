import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restarants.resolver';

@Module({
  providers: [RestaurantResolver],
})
export class RestaurantsModule {}
