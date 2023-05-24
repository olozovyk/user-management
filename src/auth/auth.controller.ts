import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { HashPasswordService } from './hashPassword.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(
    private hashPasswordService: HashPasswordService,
    private authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() body: CreateUserDto) {
    try {
      const password = this.hashPasswordService.createHash(body.password);

      const user = {
        ...body,
        password,
      };

      // todo ??? checking for existing nickname

      const newUser = await this.authService.createUser(user);

      return {
        id: newUser.id,
        nickname: newUser.nickname,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      };
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message);
      }
    }
  }
}
