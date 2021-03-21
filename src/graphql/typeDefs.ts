import gql from 'graphql-tag';

export default gql`
  enum UserRole {
    ADMIN
    PICKER
    REPORT
    DRIVER
  }

  type User {
    username: String!
    firstname: String!
    lastname: String!
    email: String!
    token: String!
    id: ID!
    role: [UserRole]!
  }

  type UserInfo {
    username: String!
    firstname: String!
    lastname: String!
    email: String!
    id: ID!
    role: [UserRole]!
  }

  type Size {
    name: String!
    values: [SizeValue!]!
    id: ID!
  }

  type SizeValue {
    value: String!
    id: ID
  }

  type Category {
    name: String!
    size: Size!
    basePrice: Int
    baseIngredients: [Ingredient!]
    options: [Option!]
    availableSides: [Item!]
    customComposition: ID
    items: [ID!]!
    id: ID!
  }

  interface Option {
    mandatory: Boolean
    name: String!
    values: [OptionValues!]!
    id: ID!
  }

  type OptionValues {
    value: String!
    priceChange: Int
    id: ID!
  }

  type Price {
    size: String!
    price: Int!
  }

  type Item {
    name: String!
    description: String!
    category: ID!
    size: Size!
    basePrice: [Price!]!
    ingriedients: [Ingredient!]!
    itemOptions: [Option!]
    availableSides: [Item!]
    customComposition: ID
    noInheritFromCategory: Boolean
    id: ID!
  }

  interface Ingredient {
    name: String!
    price: Price!
    size: Size!
    id: ID!
  }

  type CustomComposition {
    ingredients: [Ingredient!]!
    items: [ID]!
    size: Size!
  }
  type CustomCompositionIngredient implements Ingredient {
    name: String!
    price: Price!
    size: Size!
    removable: Boolean!
    group: String
    maxNumber: Int
    id: ID!
  }

  input OptionInput {
    mandatory: Boolean
    name: String!
    values: [OptionValuesInput!]!
  }

  input OptionValuesInput {
    value: String!
    priceChange: Int
  }

  input PriceInput {
    size: String!
    price: Int!
  }

  input ItemInput {
    name: String!
    description: String
    category: ID!
    size: [String!]!
    ingriedients: [String!]
    itemOptions: [OptionInput!]
    availableSides: [String!]
    price: PriceInput!
    customComposition: ID
  }

  input UpdateItemInput {
    name: String
    description: String
    category: ID
    size: [String]
    ingriedients: [String!]
    itemOptions: [OptionInput!]
    availableSides: [String!]
    price: PriceInput
    customComposition: ID
  }

  type Query {
    getCategory(categoryId: ID!): Category!
    getCategories: [Category!]!
    getItems(categories: [ID!]!): [Item]!
  }

  type Mutation {
    login(username: String!, password: String!): User
    createUser(
      firstname: String
      lastname: String
      email: String
      role: [String!]!
    ): String
    register(token: String, username: String, password: String): String!
    passwordReset(username: String, email: String): String!
    completePasswordReset(token: String, password: String): String!
    createSize(name: String!, values: [String!]!): Size!
    createCategory(
      name: String!
      options: [OptionInput!]
      customComposition: ID
    ): Category!
    updateCategory(id: ID!, name: String!): Category!
    createItem(itemInput: ItemInput): Item
    updateItem(itemId: ID!, itemInput: UpdateItemInput): Item
    createCustomComposition(
      items: [ID!]
      ingredients: [ID!]!
    ): CustomComposition!
    updateCustomComposition(
      items: [ID!]
      ingredients: [ID!]!
    ): CustomComposition!
  }
`;
