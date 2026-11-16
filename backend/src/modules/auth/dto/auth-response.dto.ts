import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: '654321654321654321654321' })
  id: string;

  @ApiProperty({ example: 'Adrian Rocha' })
  name: string;

  @ApiProperty({ example: 'adriancamrochac@gmail.com' })
  email: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT de acceso',
  })
  accessToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
