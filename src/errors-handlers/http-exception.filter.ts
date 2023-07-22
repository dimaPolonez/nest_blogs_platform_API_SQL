import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 500) {
      response.status(status).json(exception);
    }

    if (status === 400) {
      const errors: any = exception.getResponse();

      if (typeof errors.message === 'string') {
        response.status(status).json({
          errorsMessages: [
            { message: errors.message, field: 'Data is not valid' },
          ],
        });
        return;
      }
      response.status(status).json({
        errorsMessages: errors.message.map((x) => {
          return { message: x.message, field: x.field };
        }),
      });
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
