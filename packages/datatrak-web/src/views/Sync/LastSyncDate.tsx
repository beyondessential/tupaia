import { Typography } from '@material-ui/core';
import { formatRelative } from 'date-fns';
import { enAU } from 'date-fns/locale';
import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

const Heading = styled(Typography).attrs({ variant: 'h2' })`
  font-size: inherit;
  letter-spacing: initial;
`;

const Paragraph = styled.p`
  margin-block: 0;
`;

/**
 * Customising {@link formatRelative} is done on a locale-by-locale basis. Hard-coding a locale
 * isn’t ideal, and the choice of {@link enAU} is arbitrary; but this saves us from trying to
 * figure out what locale date-fns is currently defaulting to.
 *
 * @see https://github.com/search?q=repo%3Adate-fns%2Fdate-fns%20formatrelativelocale&type=code
 */
const customFormatRelative = (date: Date, baseDate: Date = new Date()): string => {
  const customMap = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "PPP 'at' p",
  };
  const locale = {
    ...enAU,
    formatRelative: (token: keyof typeof customMap) => customMap[token],
  };

  return formatRelative(date, baseDate, {
    locale,
    weekStartsOn: 1,
  });
};

interface LastSyncDateProps extends HTMLAttributes<HTMLDivElement> {
  date: Date | null;
}

export const LastSyncDate = ({ date, ...props }: LastSyncDateProps) => {
  return (
    <div {...props}>
      <Heading>Last successful sync</Heading>
      <Paragraph>
        {date === null ? (
          'Never'
        ) : (
          <time dateTime={date.toISOString()} title={date.toLocaleString()}>
            {customFormatRelative(date)}
          </time>
        )}
      </Paragraph>
    </div>
  );
};
