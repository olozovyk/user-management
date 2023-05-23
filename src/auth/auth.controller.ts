import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';

@Controller('auth')
export class AuthController {
  @Post()
  signup(@Body() user: CreateUserDto) {
    // get data from body
    // validate dto
    // create User, Token entities
    //
    // create migrations
    // hash password
    // add user to DB
    // return user
  }
}
