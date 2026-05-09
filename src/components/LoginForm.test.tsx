import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';

// Mock `fetch` API
global.fetch = vi.fn();

describe('LoginForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders correctly', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  it('shows validation errors if fields are empty or invalid', async () => {
    render(<LoginForm />);
    const button = screen.getByRole('button', { name: /Se connecter/i });
    
    fireEvent.click(button);
    
    expect(await screen.findByText(/L'adresse email est requise/i)).toBeInTheDocument();
    expect(await screen.findByText(/Le mot de passe est requis/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const button = screen.getByRole('button', { name: /Se connecter/i });

    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.click(button);

    expect(await screen.findByText(/Veuillez entrer une adresse email valide/i)).toBeInTheDocument();
  });

  it('shows validation error for short password', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const button = screen.getByRole('button', { name: /Se connecter/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, '123'); // < 8 chars
    fireEvent.click(button);

    expect(await screen.findByText(/Le mot de passe doit contenir au moins 8 caractères/i)).toBeInTheDocument();
  });

  it('calls API and stores JWT on successful login', async () => {
    const mockToken = 'fake-jwt-token';
    // Mocker la réponse avec succès
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ token: mockToken }),
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const button = screen.getByRole('button', { name: /Se connecter/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/auth/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      }));
    });

    expect(localStorage.getItem('jwt_token')).toBe(mockToken);
  });

  it('displays error message from API when login fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Identifiants invalides test' }),
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const button = screen.getByRole('button', { name: /Se connecter/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(button);

    expect(await screen.findByText(/Identifiants invalides test/i)).toBeInTheDocument();
  });

  it('shows loading state while fetching', async () => {
    (global.fetch as any).mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const button = screen.getByRole('button', { name: /Se connecter/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(button);

    expect(await screen.findByText(/Connexion.../i)).toBeInTheDocument();
  });
});
