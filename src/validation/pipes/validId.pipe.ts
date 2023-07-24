import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (/^\d+$/.test(value)) {
      return value;
    }

    throw new BadRequestException();
  }
}
