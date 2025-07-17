// filepath: c:\Users\mohit\OneDrive\Desktop\projects\zecurx-platform\zecurx-backend\src\modules\auth\decorators\roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
