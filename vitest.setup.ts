import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Nettoie l'arbre DOM après chaque test
afterEach(() => {
  cleanup();
});
