import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  GoalCategory,
  GoalPriority,
  GoalStatus,
} from '../goals.constants.js';

@Schema({ _id: true, timestamps: false })
export class GoalContribution {
  _id: Types.ObjectId;

  @Prop({ required: true, min: 0.01 })
  amount: number;

  @Prop({ trim: true, maxlength: 200 })
  note?: string;

  @Prop({ type: Date, default: () => new Date() })
  date: Date;
}

export const GoalContributionSchema =
  SchemaFactory.createForClass(GoalContribution);

export type GoalDocument = HydratedDocument<Goal>;

@Schema({ timestamps: true, versionKey: false })
export class Goal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({
    type: String,
    enum: GoalCategory,
    default: GoalCategory.OTHER,
    index: true,
  })
  category: GoalCategory;

  @Prop({
    type: String,
    enum: GoalPriority,
    default: GoalPriority.MEDIUM,
    index: true,
  })
  priority: GoalPriority;

  @Prop({
    type: String,
    enum: GoalStatus,
    default: GoalStatus.ACTIVE,
    index: true,
  })
  status: GoalStatus;

  @Prop({ required: true, min: 1 })
  targetAmount: number;

  @Prop({ default: 0, min: 0 })
  currentAmount: number;

  @Prop({ min: 0 })
  monthlySavingTarget?: number;

  @Prop({ type: Date })
  targetDate?: Date;

  @Prop({ trim: true, maxlength: 500 })
  referenceUrl?: string;

  @Prop({ type: [GoalContributionSchema], default: [] })
  contributions: GoalContribution[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);

