import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutPutDto } from 'src/common/dtos/core.dto';
import { Users } from '../entities/users.entity';

@InputType()
export class EditProfileInput extends PickType(PartialType(Users), [
  'email',
  'password',
]) {}

@ObjectType()
export class EditProfileOutput extends CoreOutPutDto {}
