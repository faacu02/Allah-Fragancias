import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductCard from '@/app/components/ProductCard';

const mockProduct = {
  id: 'test-1',
  name: 'Oud Royal',
  collection: 'Obsidian',
  price: 12000,
  stock: 5,
  status: 'available',
  images: ['https://res.cloudinary.com/demo/image/upload/v1/test.jpg'],
  description: null,
};

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} onAddToCart={() => {}} />);
    expect(screen.getByText('Oud Royal')).toBeInTheDocument();
  });

  it('shows stock count in button label', () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} onAddToCart={() => {}} />);
    expect(screen.getByText('Últimas 5')).toBeInTheDocument();
  });

  it('shows "Sin Stock" badge when stock is 0', () => {
    render(
      <ProductCard
        product={{ ...mockProduct, stock: 0, status: 'agotado' }}
        onClick={() => {}}
        onAddToCart={() => {}}
      />
    );
    expect(screen.getByText('Sin Stock')).toBeInTheDocument();
  });
});
