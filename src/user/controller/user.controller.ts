import {
  Body,
  Controller,
  Logger,
  Patch,
  Post,
  UseGuards,
  Get,
  Res,
  Query,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserDto } from '../types/user.dto';
import { SearchUsersDto } from '../types/search.users.dto';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../types/create.user.dto';
import { LoginDto } from '../types/login.dto';
import { LoginResultDto } from '../types/login.result.dto';
import { UpdateUserDto } from '../types/update.user.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private readonly logger = new Logger(UserController.name);

  @ApiOperation({ description: 'Login using email and password.' })
  @ApiCreatedResponse({
    description: 'Login successful.',
    type: LoginResultDto,
  })
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ): Promise<LoginResultDto> {
    return await this.userService.login(loginDto);
  }

  @ApiOperation({
    description: 'Search users.',
  })
  @ApiOkResponse({
    description: 'Users returned.',
    type: [UserDto],
  })
  @UseGuards(AuthGuard)
  @Get('/search')
  async searchUsers(@Query() query: SearchUsersDto): Promise<UserDto[]> {
    return await this.userService.searchUsers(query);
  }

  @ApiOperation({
    description: 'Get user by ID.',
  })
  @ApiOkResponse({
    description: 'User returned.',
    type: UserDto,
  })
  @UseGuards(AuthGuard)
  @Get('/:userId')
  async getUserById(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<UserDto> {
    return await this.userService.getUserById(userId);
  }

  @ApiOperation({
    description: 'Create user.',
  })
  @ApiCreatedResponse({
    description: 'User created.',
    type: UserDto,
  })
  @UseGuards(AuthGuard)
  @Post('/')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return await this.userService.createUser(createUserDto);
  }

  @ApiOperation({
    description: 'Update user.',
  })
  @ApiOkResponse({
    description: 'User updated.',
    type: UserDto,
  })
  @UseGuards(AuthGuard)
  @Patch('/:userId')
  async updateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return await this.userService.updateUser(userId, updateUserDto);
  }
}
