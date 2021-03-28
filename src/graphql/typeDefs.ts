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
    values: [String!]!
    id: ID!
  }

  type Category {
    name: String!
    size: Size!
    basePrice: [Price!]
    baseIngredients: [Ingredient!]
    options: [Option!]
    availableSides: [Item!]
    customComposition: ID
    items: [ID!]!
    id: ID!
  }

  type Option {
    mandatory: Boolean
    name: String!
    values: [OptionValues!]!
    id: ID!
  }

  type OptionValues {
    value: String!
    priceChange: Float
    id: ID!
  }

  type Price {
    size: String!
    price: Float!
    id: ID
  }

  type Item {
    name: String!
    description: String!
    category: Category!
    size: Size!
    basePrice: [Price!]!
    price: [Price!]!
    ingredients: [Ingredient!]!
    itemOptions: [Option!]
    availableSides: [Item!]
    customComposition: ID
    noInheritFromCategory: Boolean
    id: ID!
  }

  type Ingredient {
    name: String!
    price: [Price!]!
    size: Size!
    uniqueName: ID!
    id: ID!
  }

  type CustomComposition {
    id: ID!
    name: String!
    ingredients: [CustomCompositionIngredient!]!
    items: [ID]!
    size: Size!
  }
  type CustomCompositionIngredient {
    ingredient: Ingredient!
    removable: Boolean!
    group: String
    maxNumber: Int
    id: ID!
  }

  input OptionInput {
    name: String!
    mandatory: Boolean!
    multi: Boolean!
    maxSelect: Int!
    values: [OptionValuesInput!]
  }

  input OptionValuesInput {
    value: String!
    priceChange: Int!
  }

  input PriceInput {
    size: String!
    price: Float!
  }


  input UpdateSizeValue {
    oldValue: String
    newValue: String
  }

  input CustomCompositionIngredientInput {
    ingredient: ID!
    removable: Boolean!
    group: String!
    maxNumber: Int!
  }

  type Query {
    getCategory(categoryId: ID!): Category!
    getCategories: [Category!]!

    getItem: String
    getItems(categories: [ID!]!): [Item]!

    getSize: String
    getSizes: String

    getIngredient: String
    getIngredients: String
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
    updateSize(name: String, updateValues: [UpdateSizeValue]): Size!
    deleteSize(id: ID): String!

    createIngredient(
      name: String!
      size: ID!
      uniqueName: String!
      price: [PriceInput!]!
    ): Ingredient!
    updateIngredient(
      id: ID!
      name: String
      size: ID
      uniqueName: String
      price: [PriceInput]
    ): Ingredient!
    deleteIngredient(id: ID): String!

    createCategory(
      name: String!
      customComposition: ID
      size: ID
      basePrice: [PriceInput!]
      baseIngredients: [ID!]
      options: [OptionInput!]
      availableSides: [ID!]
    ): Category!
    updateCategory(
      id: ID!
      name: String!
      options: [OptionInput!]
      customComposition: ID
    ): Category!
    deleteCategory(id: ID): String!

    createItem(
      name: String!
      description: String
      customComposition: ID
      category: ID!
      noInheritFromCategory: Boolean!
      size: ID
      basePrice: [PriceInput!]
      ingredients: [ID!]
      itemOptions: [OptionInput!]
      availableSides: [ID!]
    ): Item!
    updateItem(itemId: ID!): Item!
    deleteItem(id: ID!): String!

    createCustomComposition(
      name: String!
      groups: [String!]!
      size: ID!
      ingredients: [CustomCompositionIngredientInput!]!
    ): CustomComposition!
    updateCustomComposition(
      name: String!
      groups: [String!]!
      size: ID!
      ingredients: [CustomCompositionIngredientInput!]!
    ): CustomComposition!
    deleteCustomComposition(id: ID!): String!
  }
`;
