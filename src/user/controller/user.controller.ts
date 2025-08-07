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
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiParam,
  ApiBadRequestResponse,
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

  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password to receive a session token.',
  })
  @ApiCreatedResponse({
    description: 'Login successful',
    type: LoginResultDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid login credentials or user not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ): Promise<LoginResultDto> {
    return await this.userService.login(loginDto);
  }

  @ApiOperation({
    summary: 'Search users',
    description: 'Search users with optional filters. Supports pagination and various search criteria.',
  })
  @ApiOkResponse({
    description: 'Users found successfully',
    type: [UserDto],
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @UseGuards(AuthGuard)
  @Get('/search')
  async searchUsers(@Query() query: SearchUsersDto): Promise<UserDto[]> {
    return await this.userService.searchUsers(query);
  }

  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their unique identifier.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'User found successfully',
    type: UserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @UseGuards(AuthGuard)
  @Get('/:userId')
  async getUserById(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<UserDto> {
    return await this.userService.getUserById(userId);
  }

  @ApiOperation({
    summary: 'Create user',
    description: 'Create a new user account with the provided data.',
  })
  @ApiCreatedResponse({
    description: 'User successfully created',
    type: UserDto,
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
  })
  @ApiBadRequestResponse({
    description: 'Invalid user data provided',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @UseGuards(AuthGuard)
  @Post('/')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return await this.userService.createUser(createUserDto);
  }

  @ApiOperation({
    summary: 'Update user',
    description: 'Update an existing user with new data. Only the provided fields will be updated.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'User successfully updated',
    type: UserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid user data provided',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
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
