import { isValid } from 'date-fns';
import React, { HTMLAttributes } from 'react';

type DateTimeDisplayVariant = 'date' | 'dateTime' | 'time';

interface DateTimeDisplayProps extends HTMLAttributes<HTMLTimeElement> {
  date?: Date | null;
  variant?: DateTimeDisplayVariant;
}

const localeStringMethods: Record<
  DateTimeDisplayVariant,
  keyof Pick<Date, 'toLocaleDateString' | 'toLocaleString' | 'toLocaleTimeString'>
> = {
  date: 'toLocaleDateString',
  dateTime: 'toLocaleString',
  time: 'toLocaleTimeString',
};

export const DateTimeDisplay = ({ date, variant = 'dateTime', ...props }: DateTimeDisplayProps) => {
  if (!date || !isValid(date)) return null;

  const stringifier = localeStringMethods[variant];
  return (
    <time dateTime={date.toISOString()} {...props}>
      {date[stringifier]()}
    </time>
  );
};
