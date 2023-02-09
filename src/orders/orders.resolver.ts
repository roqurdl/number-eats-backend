import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { PUB_SUB } from 'src/common/common.constant';
import { Users } from 'src/users/entities/users.entity';
import { CreateOrderOutput, CreateOrderInput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver((of) => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation((returns) => CreateOrderOutput)
  async createOrder(
    @AuthUser() customer: Users,
    @Args(`input`) createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query((returns) => GetOrdersOutput)
  @Role([`Any`])
  async getOrders(
    @AuthUser() user: Users,
    @Args(`input`) getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(user, getOrdersInput);
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: Users,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.orderService.getOrder(user, getOrderInput);
  }

  @Mutation((returns) => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: Users,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(user, editOrderInput);
  }

  @Mutation((returns) => Boolean)
  async potatoReady(@Args('potatoId') potatoId: number) {
    await this.pubSub.publish('hotPotatos', {
      readyPotato: potatoId,
    });
    return true;
  }

  @Subscription((returns) => String, {
    filter: ({ readyPotato }, { potatoId }) => {
      return readyPotato === potatoId;
    },
    resolve: ({ readyPotato }) =>
      `Your potato with the id ${readyPotato} is ready!`,
  })
  @Role(['Any'])
  readyPotato(@Args('potatoId') potatoId: number) {
    return this.pubSub.asyncIterator('hotPotatos');
  }
}
