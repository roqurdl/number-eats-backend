import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restarant.entity';

@InputType()
export class createRestaurantDto extends OmitType(
  Restaurant,
  [`id`],
  InputType,
) {}
