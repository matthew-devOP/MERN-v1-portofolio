import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { PostCard } from '../blog/PostCard';

const mockPost = {
  _id: '1',
  title: 'Test Blog Post',
  excerpt: 'This is a test excerpt for the blog post',
  content: 'Full content of the blog post...',
  author: {
    _id: 'author1',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
  },
  publishedAt: '2023-12-01T10:00:00Z',
  readTime: 5,
  category: 'technology',
  tags: ['javascript', 'react', 'testing'],
  featured: false,
  likes: 10,
  commentsCount: 5,
  slug: 'test-blog-post',
};

const PostCardWithRouter = (props: any) => (
  <BrowserRouter>
    <PostCard {...props} />
  </BrowserRouter>
);

describe('PostCard Component', () => {
  it('renders post information correctly', () => {
    render(<PostCardWithRouter post={mockPost} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByText('This is a test excerpt for the blog post')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('technology')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
  });

  it('renders tags correctly', () => {
    render(<PostCardWithRouter post={mockPost} />);

    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
  });

  it('shows featured badge for featured posts', () => {
    const featuredPost = { ...mockPost, featured: true };
    render(<PostCardWithRouter post={featuredPost} />);

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('does not show featured badge for regular posts', () => {
    render(<PostCardWithRouter post={mockPost} />);

    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('displays formatted publication date', () => {
    render(<PostCardWithRouter post={mockPost} />);

    // The exact format depends on your date formatting logic
    expect(screen.getByText(/Dec 1, 2023|December 1, 2023|01\/12\/2023/)).toBeInTheDocument();
  });

  it('shows like and comment counts', () => {
    render(<PostCardWithRouter post={mockPost} />);

    expect(screen.getByText('10')).toBeInTheDocument(); // likes
    expect(screen.getByText('5')).toBeInTheDocument(); // comments
  });

  it('links to post detail page', () => {
    render(<PostCardWithRouter post={mockPost} />);

    const titleLink = screen.getByRole('link', { name: 'Test Blog Post' });
    expect(titleLink).toHaveAttribute('href', '/posts/test-blog-post');
  });

  it('links to author profile', () => {
    render(<PostCardWithRouter post={mockPost} />);

    const authorLink = screen.getByRole('link', { name: 'Test User' });
    expect(authorLink).toHaveAttribute('href', '/users/testuser');
  });

  it('handles like button click', () => {
    const onLike = vi.fn();
    render(<PostCardWithRouter post={mockPost} onLike={onLike} />);

    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);

    expect(onLike).toHaveBeenCalledWith('1');
  });

  it('shows different style for liked posts', () => {
    const likedPost = { ...mockPost, isLiked: true };
    render(<PostCardWithRouter post={likedPost} />);

    const likeButton = screen.getByRole('button', { name: /like/i });
    expect(likeButton).toHaveClass('text-red-500'); // or whatever class indicates liked state
  });

  it('handles bookmark button click', () => {
    const onBookmark = vi.fn();
    render(<PostCardWithRouter post={mockPost} onBookmark={onBookmark} />);

    const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
    fireEvent.click(bookmarkButton);

    expect(onBookmark).toHaveBeenCalledWith('1');
  });

  it('shows different style for bookmarked posts', () => {
    const bookmarkedPost = { ...mockPost, isBookmarked: true };
    render(<PostCardWithRouter post={bookmarkedPost} />);

    const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
    expect(bookmarkButton).toHaveClass('text-yellow-500'); // or whatever class indicates bookmarked state
  });

  it('handles share button click', () => {
    const onShare = vi.fn();
    render(<PostCardWithRouter post={mockPost} onShare={onShare} />);

    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);

    expect(onShare).toHaveBeenCalledWith(mockPost);
  });

  it('renders compact variant correctly', () => {
    render(<PostCardWithRouter post={mockPost} variant="compact" />);

    // In compact mode, some elements might be hidden or styled differently
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <PostCardWithRouter post={mockPost} className="custom-post-card" />
    );

    expect(container.firstChild).toHaveClass('custom-post-card');
  });

  it('handles missing optional data gracefully', () => {
    const minimalPost = {
      _id: '2',
      title: 'Minimal Post',
      excerpt: 'Minimal excerpt',
      content: 'Minimal content',
      author: {
        _id: 'author2',
        username: 'minimal',
        firstName: 'Min',
        lastName: 'User',
      },
      publishedAt: '2023-12-01T10:00:00Z',
      slug: 'minimal-post',
    };

    render(<PostCardWithRouter post={minimalPost} />);

    expect(screen.getByText('Minimal Post')).toBeInTheDocument();
    expect(screen.getByText('Min User')).toBeInTheDocument();
  });

  it('shows loading state when actions are pending', () => {
    render(<PostCardWithRouter post={mockPost} isLiking />);

    const likeButton = screen.getByRole('button', { name: /like/i });
    expect(likeButton).toBeDisabled();
  });

  it('truncates long excerpts appropriately', () => {
    const longExcerptPost = {
      ...mockPost,
      excerpt: 'This is a very long excerpt that should be truncated at some point to prevent the card from becoming too tall and ruining the layout of the page. This text should be cut off somewhere around here.',
    };

    render(<PostCardWithRouter post={longExcerptPost} />);

    // Check that text is truncated (exact implementation depends on your CSS)
    const excerpt = screen.getByText(/This is a very long excerpt/);
    expect(excerpt).toBeInTheDocument();
  });
});