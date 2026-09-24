export interface Story {
  id: string;
  creatorId: string;
  title: string;
  tag: string;
  excerpt: string;
  readTime: string;
}

// Sample/demo content — clearly fictional and illustrative only.
export const STORIES: Story[] = [
  {
    id: 'st1',
    creatorId: 's1',
    title: 'A Canvas That Begins with a Prayer',
    tag: 'Behind the scenes',
    excerpt:
      'Sunita grinds her own pigments each morning. We spent an afternoon in her courtyard watching three generations of Madhubani fill an entire wall flower by flower.',
    readTime: '4 min read',
  },
  {
    id: 'st2',
    creatorId: 'a1',
    title: 'Loop by Loop on a Kolkata Verandah',
    tag: 'Craft process',
    excerpt:
      'From a grandmother\'s pattern book to hundreds of sunflower pots — Ananya shows the knots, the late-night frogging, and the exact rhythm of a well-loved hook.',
    readTime: '3 min read',
  },
  {
    id: 'st3',
    creatorId: 'a2',
    title: 'Inside the Kilns of Khurja',
    tag: 'Workshop tour',
    excerpt:
      'Abdul\'s father fired pots before independence. Today the same wheel spins terracotta for homes across India — a photo essay from the family kiln at dawn.',
    readTime: '5 min read',
  },
  {
    id: 'st4',
    creatorId: 's3',
    title: 'The Sea Breeze That Cures Macramé',
    tag: 'Making of',
    excerpt:
      'Sofia\'s knots dry on a Goa balcony where the air does half the work. A short film on rope, rhythm and the patience of hand-tied craft.',
    readTime: 'Video · 2 min',
  },
];