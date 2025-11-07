import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Projects/i);
  expect(headingElement).toBeInTheDocument();
});
