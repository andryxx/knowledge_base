import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { 
  ArrayMaxSize, 
  IsBoolean, 
  IsOptional, 
  IsArray, 
  IsDateString, 
  IsNumber, 
  Min, 
  Max, 
  IsString, 
  Length,
  IsEnum,
  ValidateIf
} from "class-validator";
import { AccessEnum } from '@typeorm/models/article.entity';
import { IsDateRangeValid } from 'src/common/validators/date-range.validator';

export class SearchArticlesDto {
  @ApiProperty({
    description: "Limit of articles to return.",
    required: false,
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value) || 10)
  limit: number = 10;

  @ApiProperty({
    description: "Offset of articles to return.",
    required: false,
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value) || 0)
  offset: number = 0;

  @ApiPropertyOptional({
    description: "Filter by active.",
    required: false,
    type: String,
    example: "true",
  })
  @IsOptional()
  @Transform(({ value = "true" }) => value.toLowerCase() === "true")
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    description: "Tags, passed in query as a comma separated list.",
    required: false,
    type: [String],
    example: "starcraft,kerrigan,zerg",
    maxItems: 50,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) : undefined))
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateIf((o) => o.tags !== undefined)
  @IsString({ each: true })
  @Length(1, 50, { each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: "Filter by header.",
    required: false,
    type: String,
    example: "Керриган",
    minLength: 1,
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  @Length(1, 128)
  header?: string;

  @ApiPropertyOptional({
    description: "Filter by access.",
    required: false,
    enum: AccessEnum,
    example: AccessEnum.PUBLIC,
  })
  @IsOptional()
  @IsEnum(AccessEnum)
  access?: AccessEnum;

  @ApiPropertyOptional({
    description: "Filter by creation date from (ISO 8601 format).",
    required: false,
    type: String,
    example: "2024-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.createdAtFrom !== undefined)
  createdAtFrom?: string;

  @ApiPropertyOptional({
    description: "Filter by creation date to (ISO 8601 format).",
    required: false,
    type: String,
    example: "2024-12-31T23:59:59.999Z",
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.createdAtTo !== undefined)
  @IsDateRangeValid()
  createdAtTo?: string;
}
