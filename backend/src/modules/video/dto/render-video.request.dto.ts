import { IsString, MinLength } from 'class-validator';

export class RenderVideoRequestDto {
  @IsString()
  @MinLength(1)
  text: string;

  @IsString()
  @MinLength(1)
  imagePath: string;
}
