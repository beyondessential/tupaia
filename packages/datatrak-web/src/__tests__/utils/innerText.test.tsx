import React from 'react';
import { innerText } from '../../utils';

describe('ReactText', () => {
  it('gets correct innerText from an empty string', () => {
    expect(innerText('')).toBe('');
  });

  it('gets correct innerText from a nonempty string', () => {
    expect(innerText('foo bar baz')).toBe('foo bar baz');
  });

  it('gets correct innerText from zero', () => {
    expect(innerText(0)).toBe('0');
  });

  it('gets correct innerText from a positive integer', () => {
    expect(innerText(789068)).toBe('789068');
  });

  it('gets correct innerText from a negative integer', () => {
    expect(innerText(-276895)).toBe('-276895');
  });

  it('gets correct innerText from a positive floating point number', () => {
    expect(innerText(0.24538)).toBe('0.24538');
  });

  it('gets correct innerText from a negative floating point number', () => {
    expect(innerText(-0.52467)).toBe('-0.52467');
  });
});

describe('Nullish `ReactNode`s', () => {
  it('gets empty string from undefined', () => {
    expect(innerText(undefined)).toBe('');
  });

  it('gets empty string from null', () => {
    expect(innerText(undefined)).toBe('');
  });
});

describe('Non-nullish `ReactNode`s', () => {
  it('gets correct innerText from a simple node', () => {
    expect(innerText(<p>foo bar baz</p>)).toBe('foo bar baz');
  });

  it('gets correct innerText from a node with one element child', () => {
    expect(
      innerText(
        <p>
          <span>foo bar baz</span>
        </p>,
      ),
    ).toBe('foo bar baz');
  });

  it('gets correct innerText from a complex node', () => {
    expect(
      innerText(
        <p>
          foo <strong>bar</strong> baz
        </p>,
      ),
    ).toBe('foo bar baz');
  });

  it('gets correct innerText from a complex-er node', () => {
    expect(
      innerText(
        <p>
          <em>foo</em> <strong>bar</strong> <span>baz</span>
        </p>,
      ),
    ).toBe('foo bar baz');
  });

  it('gets correct innerText from a very complex node', () => {
    expect(
      innerText(
        <p>
          <em>foo</em> <strong>bar</strong> <span>baz</span>
        </p>,
      ),
    ).toBe('foo bar baz');
  });

  it('gets correct innerText from a super duper complex node', () => {
    expect(
      innerText(
        <article>
          <p>
            <a href="https://bes.au">Call me Ishmael.</a> <span>Some years ago</span>&mdash;never
            mind how long <span>precisely</span>&mdash;having <mark>little or no money</mark> in my
            purse, and nothing particular of interest to me on shore, I thought I would{' '}
            <u>
              sail about <s>a little</s> and see
            </u>{' '}
            the watery part of the world.
          </p>
        </article>,
      ),
    ).toBe(
      'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money ' +
        'in my purse, and nothing particular of interest to me on shore, I thought I would sail ' +
        'about a little and see the watery part of the world.',
    );
  });
});

describe('`ReactFragment`s', () => {
  it('gets correct innerText from a simple fragment', () => {
    expect(innerText(<>foo bar baz</>)).toBe('foo bar baz');
  });

  it('gets correct innerText from a complex fragment', () => {
    expect(
      innerText(
        <>
          <em>foo</em> bar <span>baz</span>
        </>,
      ),
    ).toBe('foo bar baz');
  });
});

describe('Misc', () => {
  it('interprets character entities', () => {
    expect(innerText(<>&copy;</>)).toBe('©');
    expect(innerText(<>&nbsp;</>)).toBe(' ');
    expect(innerText(<>&ndash;</>)).toBe('–');
    expect(innerText(<>&rdquo;</>)).toBe('”');
    expect(innerText(<>&sect;</>)).toBe('§');
  });

  it('preserves preformatted text', () => {
    const text = `
Hello
            &nbsp;
      world
         !
`;
    expect(innerText(<pre>{text}</pre>)).toBe(text);
  });
});
