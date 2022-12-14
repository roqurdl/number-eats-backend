import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Users } from './users.entity';
import { v4 as uuidv4 } from 'uuid';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field((_) => String)
  code: string;

  @OneToOne((_) => Users, { onDelete: 'CASCADE', onUpdate: `CASCADE` })
  @JoinColumn()
  user: Users;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
