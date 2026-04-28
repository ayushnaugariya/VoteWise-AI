import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Timeline from './Timeline';

describe('Timeline page', () => {
  it('presents the complete election process in the expected order', () => {
    render(<Timeline />);

    const headings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);

    expect(headings).toEqual([
      'Election Announcement',
      'Candidate Nominations',
      'Election Campaigning',
      'Voting Day',
      'Vote Counting',
      'Result Declaration',
      'Government Formation',
    ]);
  });

  it('links users to the official Election Commission source', () => {
    render(<Timeline />);

    const officialLink = screen.getByRole('link', {
      name: /Learn more at Election Commission of India website/i,
    });

    expect(officialLink.getAttribute('href')).toBe('https://eci.gov.in');
    expect(officialLink.getAttribute('rel')).toContain('noopener');
  });
});
