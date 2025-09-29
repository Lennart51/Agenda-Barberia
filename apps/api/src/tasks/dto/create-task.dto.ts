import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PriorityValues } from './priority';
import type { Priority } from './priority';

export class CreateTaskDto {
 @ApiProperty() @IsString() @IsNotEmpty() title!: string;
 @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;

 @ApiProperty({ enum: PriorityValues, default: 'MEDIUM' })
 @IsOptional()
 @IsEnum(PriorityValues)priority?: Priority = 'MEDIUM';
 @ApiProperty({ required: false }) @IsOptional() @IsDateString() dueDate?:
string;
}