import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  // This method is called by NestJS to determine if a request is authorized
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Extract the HTTP request object from the context
    const request: Request = context.switchToHttp().getRequest();
    // Extract the JWT token from the Authorization header
    const token = this.extractTokenFromHeader(request);
    // If no token is found, throw Unauthorized (401)
    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }
    try {
      // Verify the token using JwtService
      const payload = this.jwtService.verify(token);
      // Optionally attach the decoded payload (user info) to request object
      request['user'] = payload;
      // If token is valid, allow the request to proceed
      return true;
    } catch (e) {
      // If token verification fails, throw Unauthorized exception
      throw new UnauthorizedException('Invalid token');
    }
  }
  // Helper method to extract Bearer token from Authorization header
  private extractTokenFromHeader(request: Request): string | undefined {
    // Authorization header format: 'Bearer <token>'
    return request.headers.authorization?.split(' ')[1];
  }
}
