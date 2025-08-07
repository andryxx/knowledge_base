import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { ArrayMaxSize, IsBoolean, IsOptional, IsArray } from "class-validator";
import { AccessEnum } from '@typeorm/models/article.entity';

export class SearchArticlesDto {
  @ApiProperty({
    description: "Limit of articles to return.",
    required: false,
    example: 10,
  })
  limit: number = 10;

  @ApiProperty({
    description: "Offset of articles to return.",
    required: false,
    example: 0,
  })
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
  })
  @IsOptional()
  @Transform(({ value }) => (value ? value.split(",") : undefined))
  @IsArray()
  @ArrayMaxSize(50)
  tags?: string[];

  @ApiPropertyOptional({
    description: "Filter by header.",
    required: false,
    type: String,
    example: "Керриган",
  })
  @IsOptional()
  header?: string;

  @ApiPropertyOptional({
    description: "Filter by access.",
    required: false,
    enum: AccessEnum,
    example: AccessEnum.PUBLIC,
  })
  @IsOptional()
  access?: AccessEnum;
}
