import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ViewControls from './ViewControls';

describe('ViewControls', () => {
  it('offers five focusable labeled buttons that invoke their actions', () => {
    const actions = {
      on3D: vi.fn(),
      on2D: vi.fn(),
      onFitRoute: vi.fn(),
      onTemple11: vi.fn(),
      onTemple12: vi.fn(),
    };
    render(<ViewControls {...actions} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);

    for (const [label, callback] of [
      ['3D', actions.on3D],
      ['2D', actions.on2D],
      ['Fit route', actions.onFitRoute],
      ['T11', actions.onTemple11],
      ['T12', actions.onTemple12],
    ] as const) {
      const button = screen.getByRole('button', { name: label });
      button.focus();
      expect(button).toHaveFocus();
      fireEvent.click(button);
      expect(callback).toHaveBeenCalledTimes(1);
    }
  });
});
