import { Transform } from 'class-transformer';

export function TrimDecorator(): PropertyDecorator {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}
