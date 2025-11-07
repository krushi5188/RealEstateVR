import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the main upload card heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Upload Your Floor Plan/i);
  expect(headingElement).toBeInTheDocument();
});
