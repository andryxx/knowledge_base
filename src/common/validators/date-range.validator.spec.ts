import { validate } from 'class-validator';
import { IsDateRangeValid } from './date-range.validator';

class TestDto {
  @IsDateRangeValid()
  createdAtTo?: string;

  createdAtFrom?: string;
}

describe('IsDateRangeValid', () => {
  it('should pass when only createdAtTo is provided', async () => {
    const dto = new TestDto();
    dto.createdAtTo = '2024-12-31T23:59:59.999Z';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when only createdAtFrom is provided', async () => {
    const dto = new TestDto();
    dto.createdAtFrom = '2024-01-01T00:00:00.000Z';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when neither date is provided', async () => {
    const dto = new TestDto();

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when from date is before to date', async () => {
    const dto = new TestDto();
    dto.createdAtFrom = '2024-01-01T00:00:00.000Z';
    dto.createdAtTo = '2024-12-31T23:59:59.999Z';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass when from date equals to date', async () => {
    const dto = new TestDto();
    dto.createdAtFrom = '2024-01-01T00:00:00.000Z';
    dto.createdAtTo = '2024-01-01T00:00:00.000Z';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when from date is after to date', async () => {
    const dto = new TestDto();
    dto.createdAtFrom = '2024-12-31T23:59:59.999Z';
    dto.createdAtTo = '2024-01-01T00:00:00.000Z';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isDateRangeValid).toBe(
      'Date range is invalid: "from" date must be before or equal to "to" date'
    );
  });
}); 