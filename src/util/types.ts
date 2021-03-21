import { Document } from 'mongoose';

type SizeType = string | Size;
type ItemType = string[] | Item[];
type IngredientType = string[] | Ingredient[];
type CategoryType = string[] | Category[];
type CustomCompositionType = string | CustomComposition;

export interface User {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string[];
  token?: string;
  password?: string;
  resetPassword?: string;
  invitation?: string;
  _id?: string;
  id?: string;
}

export interface UserDoc extends Document, User {
  _id?: string;
  id: string;
}

export interface Price {
  size: string;
  price: number;
}

export interface Options {
  mandatory: boolean;
  name: string;
  values: { value: string; priceChange: number }[];
}

export interface Category {
  name: string;
  size: SizeType;
  Price: Price[];
  baseIngredients: ItemType;
  options: Options[];
  availableSides?: ItemType;
  items: ItemType;
  customComposition?: CustomCompositionType;
}
export interface CategoryDoc extends Document, Category {}

export interface CustomComposition {
  size: SizeType;
  groups: string[];
  ingredients: {
    ingredient: IngredientType;
    removable: boolean;
    group: string;
    maxNumber: number;
  };
  category: CategoryType;
  items: ItemType;
}

export interface Item {
  name: string;
  description: string;
  category: string;
  noInheritFromCategory?: boolean;
  size: string[] | object[];
  Price: Price[];
  ingredients: string[];
  itemOptions: Options[];
  availableSides?: string[];
  customComposition?: string;
}

export interface Ingredient {
  name: string;
  uniqueName: string;
  price: Price[];
  size: SizeType;
}

export interface IngredientDoc extends Document, Ingredient {
  _id?: string;
  id: string;
}

export interface Size {
  name: string;
  values: { value: string; id?: string }[];
  id?: string;
}

export enum EmailType {
  invite = 'invite',
  reset = 'reset',
}

export interface EmailLocals {
  firstname?: string;
  url?: string;
}
