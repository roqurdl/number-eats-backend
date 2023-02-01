# Number-Eats

The Backend of Uber Eats Clone

About postgreSQL
entity: like collections in MongoDB
Making an entity is simillar to use decorator in TS,GraphQL
so when we use ts, graphql is better decision to use postgreSQL than mongoDB

Active Record : access DB in Model, using small project
Data Mapper : access DB using repository, help maintainability using large app
Repository is a class that define all query, method and conduct CURD object also, can use it many ways like testing
In this project using Data Mapper pattern

Using Mapped Type to handle entity with dtos

## User Model:"

-id
-createAt
-updatedAt

-email
-password
-role(client|owner|delivery)

## User CRUD:

-Create Account
-Log In
-See Profile
-Edit Profile
-Delete Account
-Verify Email

## Restaurant CRUD:

typeorm @EntityRepository를 활용한 editRestaurant 작업에서 EntityRepository is deprecated.
@CustomRepository로 대체
