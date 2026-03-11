import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SmartQueryContext } from '../interfaces';

export const SmartQuery = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SmartQueryContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.smartQuery as SmartQueryContext;
  },
);
