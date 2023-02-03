import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends CoreOutPutDto {
  @Field((type) => [Category], { nullable: true })
  categories?: Category[];
}
