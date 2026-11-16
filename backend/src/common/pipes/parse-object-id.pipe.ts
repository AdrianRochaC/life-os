import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Types } from 'mongoose';

/** Validates that a route parameter is a valid MongoDB ObjectId string. */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!Types.ObjectId.isValid(value)) {
      const label = metadata.data ?? 'id';
      throw new BadRequestException(`El parámetro "${label}" no es un ObjectId válido.`);
    }
    return value;
  }
}

