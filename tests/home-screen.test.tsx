import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import HomeScreen from '../app/index';

describe('HomeScreen', () => {
  it('renders the app entry screen', async () => {
    const { getByText } = await render(<HomeScreen />);

    expect(getByText('InfoVida')).toBeTruthy();
    expect(getByText('Your Expo development environment is ready.')).toBeTruthy();
  });
});
