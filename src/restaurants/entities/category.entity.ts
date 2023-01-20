import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restarant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(3)
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field((type) => [Restaurant])
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.category)
  restaurant: Restaurant[];
}
