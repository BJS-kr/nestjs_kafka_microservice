import * as mongoose from 'mongoose';
import { testSchema } from 'src/models/metric';

export const mongooseProvider = {
  provide: 'MONGOOSE_CONNECTION',
  useFactory: (): Promise<typeof mongoose> =>
    mongoose.connect('mongodb://localhost:27017'),
};

export const testSchemaProvider = {
  provide: 'METRICS',
  useFactory: (connection: mongoose.Connection) =>
    connection.model('Metrics', testSchema),
  inject: ['MONGOOSE_CONNECTION'],
};
