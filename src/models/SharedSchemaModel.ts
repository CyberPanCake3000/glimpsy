import mongoose, { Schema, models } from 'mongoose';

const SharedSchemaModel =
  models.SharedSchema ??
  mongoose.model(
    'SharedSchema',
    new Schema(
      {
        payload: { type: Schema.Types.Mixed, required: true },
      },
      { timestamps: true },
    ),
  );

export default SharedSchemaModel;