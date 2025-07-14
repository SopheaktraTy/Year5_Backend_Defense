import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from 'src/roles/decorators/permissions.decorator';
import { AuthService } from 'src/auth/auth.service';
import { PermissionDto } from 'src/roles/dto/permission.dto'; 

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

      // Check for authenticated user ID
    const userId = request.user?.id || request.userId;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request.');
    }

       // Extract required permissions from handler/class decorators
    const routePermissions: PermissionDto[] = this.reflector.getAllAndOverride(
      PERMISSION_KEY, [context.getHandler(), context.getClass()],
    );

    if (!routePermissions || routePermissions.length === 0) {
      // No permissions required for this route
      return true;
    }

      //  Get user permissions
    const userPermissions = await this.authService.getUserPermissions(userId);

    for (const requiredPermission of routePermissions) {
      const matchingPermission = userPermissions.find(
        (perm) => perm.resource === requiredPermission.resource,
      );

      if (!matchingPermission) {
        throw new ForbiddenException(
          `Missing permission for resource: ${requiredPermission.resource}`,
        );
      }

      const hasAllActions = requiredPermission.actions.every((action) =>
        matchingPermission.actions.includes(action),
      );

      if (!hasAllActions) {
        throw new ForbiddenException(
          `Missing required actions on resource: ${requiredPermission.resource}`,
        );
      }
    }

    // ✅ All checks passed
    return true;
  }
}
