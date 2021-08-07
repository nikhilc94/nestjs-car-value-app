import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';

export function Serialize(dto: any) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // Runs something before the request is handled by the request handler
    // console.log({ context });
    return handler.handle().pipe(
      map((data: any) => {
        // Run something before response is sent out
        return plainToClass(this.dto, data, { excludeExtraneousValues: true });
      }),
    );
  }
}
