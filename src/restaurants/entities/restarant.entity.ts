import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { Users } from 'src/users/entities/users.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(3)
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category, {
    nullable: true,
    onDelete: `SET NULL`,
  })
  category: Category;

  @Field((type) => Users)
  @ManyToOne((type) => Users, (user) => user.restaurants, {
    onDelete: 'CASCADE',
  })
  owner: Users;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field((type) => [Dish])
  @OneToMany((type) => Dish, (dish) => dish.restaurant)
  menu: Dish[];
}
