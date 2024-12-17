import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class RemoveNullFieldsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const plainData = instanceToPlain(data, {
          excludeExtraneousValues: true,
        });

        return Object.fromEntries(
          Object.entries(plainData).filter(([_, value]) => value !== null),
        );
      }),
    );
  }
}
