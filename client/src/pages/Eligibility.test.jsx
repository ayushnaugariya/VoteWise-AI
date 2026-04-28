import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Eligibility, { checkEligibility } from './Eligibility';

describe('checkEligibility', () => {
  it('requires voters to be 18 or older and Indian citizens', () => {
    expect(checkEligibility({ age: 17, citizenship: true, hasId: true }).eligible).toBe(false);
    expect(checkEligibility({ age: 18, citizenship: true, hasId: true }).eligible).toBe(true);
    expect(checkEligibility({ age: 30, citizenship: false, hasId: true }).eligible).toBe(false);
  });

  it('keeps ID document guidance without blocking citizenship eligibility', () => {
    const result = checkEligibility({ age: 25, citizenship: true, hasId: false });

    expect(result.eligible).toBe(true);
    expect(result.reasons.some((reason) => reason.includes('valid ID'))).toBe(true);
  });
});

describe('Eligibility page', () => {
  it('keeps the submit action disabled until required fields are complete', () => {
    render(<Eligibility />);

    const button = screen.getByRole('button', { name: /Check voting eligibility/i });
    expect(button.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Your Age/i), { target: { value: '22' } });
    fireEvent.click(screen.getByRole('radio', { name: /Yes, I am an Indian citizen/i }));
    fireEvent.change(screen.getByLabelText(/Select your state or union territory/i), {
      target: { value: 'Maharashtra' },
    });

    expect(button.disabled).toBe(false);
  });

  it('announces an eligible voter result with next registration steps', async () => {
    render(<Eligibility />);

    fireEvent.change(screen.getByLabelText(/Your Age/i), { target: { value: '22' } });
    fireEvent.click(screen.getByRole('radio', { name: /Yes, I am an Indian citizen/i }));
    fireEvent.change(screen.getByLabelText(/Select your state or union territory/i), {
      target: { value: 'Maharashtra' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Check voting eligibility/i }));

    const region = await screen.findByRole('region', { name: /Eligibility result/i });
    expect(region.textContent).toContain('You Are Eligible to Vote!');
    expect(region.textContent).toContain('How to Register / Verify Your Vote');
    expect(region.textContent).toContain('Accepted ID Documents at Polling Booth');
  });
});
