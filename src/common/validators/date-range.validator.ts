import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsDateRangeValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateRangeValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const fromDate = obj.createdAtFrom;
          const toDate = obj.createdAtTo;

          if (!fromDate || !toDate) {
            return true;
          }

          const from = new Date(fromDate);
          const to = new Date(toDate);

          return from <= to;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Date range is invalid: "from" date must be before or equal to "to" date';
        },
      },
    });
  };
} 