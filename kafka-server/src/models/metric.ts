import { Schema } from 'mongoose';

export const testSchema = new Schema({
  textLength: Number,
  responseTime: Number,
});
