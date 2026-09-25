import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface Category {
  id: string;
  name: string;
  image: string;
  itemCount: number;
  description: string;
}

export interface Creator {
  id: string;
  name: string;
  brand: string;
  avatar: string;
  workshopImage: string;
  location: string;
  locality: string;
  craft: string;
  rating: number;
  reviewCount: number;
  completedCreations: number;
  joinedYear: number;
  story: string;
  verified: boolean;
  specialties: string[];
}

export interface DigitalPassport {
  origin: string;
  craftType: string;
  materials: string[];
  hoursToCraft: string;
  batchInfo: string;
  authenticityGuarantee: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  creatorId: string;
  creatorName: string;
  creatorBrand: string;
  creatorAvatar: string;
  creatorLocation: string;
  category: string;
  categoryId: string;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  shortDescription: string;
  isEco: boolean;
  isTrending: boolean;
  isHighlyRated: boolean;
  isPocketFriendly: boolean;
  isNew: boolean;
  isNearYou: boolean;
  isGift: boolean;
  stock: number;
  preparationDays: number;
  passport: DigitalPassport;
  tags: string[];
}

export interface CustomizationDetails {
  customerName?: string;
  initials?: string;
  message?: string;
  color?: string;
  size?: string;
  material?: string;
  pattern?: string;
  specialInstructions?: string;
  hasReferenceImage?: boolean;
  extraPrice: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  customization?: CustomizationDetails;
  selectedColor?: string;
}

export interface OrderTimelineStep {
  title: string;
  description: string;
  date: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  status: 'Processing' | 'Ready to Ship' | 'Shipped' | 'Delivered';
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    locality: string;
    pincode: string;
  };
  paymentMethod: string;
  estimatedDelivery: string;
  trackingNumber: string;
  timeline: OrderTimelineStep[];
}

export interface CustomBrief {
  id: string;
  craftType: string;
  description: string;
  budget: string;
  style: string;
  deliveryDate: string;
  location: string;
  creatorId?: string;
  creatorName?: string;
  status: 'Under Review' | 'Artisan Accepted' | 'Drafting Design' | 'In Crafting';
  createdAt: string;
}

export interface Story {
  id: string;
  creatorName: string;
  creatorRole: string;
  location: string;
  title: string;
  subtitle: string;
  content: string;
  quote: string;
  image: string;
  workshopImage: string;
  craft: string;
}

interface MarketplaceContextValue {
  categories: Category[];
  creators: Creator[];
  products: Product[];
  wishlist: string[];
  cart: CartItem[];
  orders: Order[];
  customBriefs: CustomBrief[];
  stories: Story[];
  selectedLocation: string;
  activeSearchQuery: string;

  // Actions
  setSelectedLocation: (loc: string) => void;
  setActiveSearchQuery: (query: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  addToCart: (product: Product, quantity?: number, customization?: CustomizationDetails) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartSubtotal: () => number;
  createOrder: (address: Order['deliveryAddress'], paymentMethod: string, discount: number) => string;
  submitCustomBrief: (brief: Omit<CustomBrief, 'id' | 'status' | 'createdAt'>) => void;
  addNewProduct: (productData: Partial<Product>) => Product;
  updateOrderStatus: (orderId: string, nextStatus: Order['status']) => void;
}

// Initial Demo Data
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'crochet',
    name: 'Crochet',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80',
    itemCount: 42,
    description: 'Delicate handmade crochet pots, flowers, wearables & cozy essentials.',
  },
  {
    id: 'jewellery',
    name: 'Handmade Jewellery',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80',
    itemCount: 38,
    description: 'Artisan brass, silver filigree, terracotta & beaded ornaments.',
  },
  {
    id: 'resin',
    name: 'Resin Art',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    itemCount: 29,
    description: 'Preserved botanicals, ocean waves & crystal clear handcrafted decor.',
  },
  {
    id: 'woolen',
    name: 'Woolen Flowers',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80',
    itemCount: 24,
    description: 'Everlasting knitted & woolen floral bouquets that never fade.',
  },
  {
    id: 'pottery',
    name: 'Pottery',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
    itemCount: 35,
    description: 'Hand-thrown studio ceramics, rustic terracotta kulhads & glazed vases.',
  },
  {
    id: 'candles',
    name: 'Candles',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80',
    itemCount: 31,
    description: 'Pure soy wax & natural beeswax aromatherapy hand-poured candles.',
  },
  {
    id: 'paintings',
    name: 'Paintings',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    itemCount: 46,
    description: 'Madhubani, Warli, Pichwai & contemporary folk art on handmade paper.',
  },
  {
    id: 'embroidery',
    name: 'Embroidery',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    itemCount: 28,
    description: 'Intricate French knot hoop art, Kantha stitches & customized hoops.',
  },
  {
    id: 'homedecor',
    name: 'Home Décor',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
    itemCount: 52,
    description: 'Hand-carved wooden accents, macramé wall hangings & brass bells.',
  },
  {
    id: 'gifts',
    name: 'Customized Gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
    itemCount: 44,
    description: 'Personalized nameplates, keepsake boxes & customized handcrafted treasures.',
  },
];

const INITIAL_CREATORS: Creator[] = [
  {
    id: 'creator_1',
    name: 'Ananya Mukherjee',
    brand: 'Vana Crochet Studio',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
    workshopImage: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    location: 'Pune, Maharashtra',
    locality: 'Kothrud',
    craft: 'Crochet & Botanical Fiber Art',
    rating: 4.9,
    reviewCount: 142,
    completedCreations: 320,
    joinedYear: 2021,
    story:
      'Practicing crochet since childhood, Ananya spins locally sourced organic cotton and woolen yarn into botanical marvels. Every sunflower and blossom is patiently hand-hooked over 4 to 8 hours with organic dyes.',
    verified: true,
    specialties: ['Sunflower Pots', 'Everlasting Bouquets', 'Macramé Wall Hangings'],
  },
  {
    id: 'creator_2',
    name: 'Sunita Devi',
    brand: 'Mithila Heritage Crafts',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
    workshopImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    location: 'Pune, Maharashtra',
    locality: 'Alandi',
    craft: 'Madhubani & Folk Paintings',
    rating: 4.8,
    reviewCount: 98,
    completedCreations: 215,
    joinedYear: 2020,
    story:
      'A third-generation folk artist preserving the ancient Mithila tradition. Sunita uses natural extracts from marigold, turmeric, and lamp soot to paint intricate stories of nature and auspicious celebrations.',
    verified: true,
    specialties: ['Madhubani Canvas', 'Traditional Tree of Life', 'Hand-painted Bookmarks'],
  },
  {
    id: 'creator_3',
    name: 'Rajesh Prajapati',
    brand: 'Mitti Kala Workshop',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    workshopImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    location: 'Pune, Maharashtra',
    locality: 'Viman Nagar',
    craft: 'Studio Ceramics & Terracotta',
    rating: 4.9,
    reviewCount: 175,
    completedCreations: 540,
    joinedYear: 2019,
    story:
      'Handcrafting studio pottery on a manual kickwheel using alluvial clay. Rajesh combines earthy textures with food-safe lead-free glazes, inspired by Maharashtrian clay heritage.',
    verified: true,
    specialties: ['Glazed Kulhads', 'Ceramic Teapots', 'Planters'],
  },
  {
    id: 'creator_4',
    name: 'Priya Sharma',
    brand: 'Aura Botanica',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    workshopImage: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    location: 'Pune, Maharashtra',
    locality: 'Koregaon Park',
    craft: 'Botanical Candles & Aromatics',
    rating: 4.7,
    reviewCount: 110,
    completedCreations: 430,
    joinedYear: 2022,
    story:
      'Priya blends pure soy wax with natural essential oils sourced from small Indian plantations. Each candle is hand-poured in reusable amber glass with a crackling wooden wick.',
    verified: true,
    specialties: ['Saffron & Jasmine Candles', 'Pressed Flower Wax Tablets', 'Aura Sprays'],
  },
  {
    id: 'creator_5',
    name: 'Kavita Rao',
    brand: 'Taar Studio',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80',
    workshopImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    location: 'Pune, Maharashtra',
    locality: 'Baner',
    craft: 'Hand Embroidery & Hoop Art',
    rating: 4.9,
    reviewCount: 86,
    completedCreations: 190,
    joinedYear: 2021,
    story:
      'Bringing contemporary botanical illustrations alive through delicate needlework. Kavita specializes in personalized wedding hoops, family crests, and heirloom embroidered linens.',
    verified: true,
    specialties: ['Botanical Hoops', 'Custom Wedding Name Hoops', 'Embroidered Linen'],
  },
  {
    id: 'creator_6',
    name: 'Meera Sen',
    brand: 'Petal & Resin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
    workshopImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    location: 'Pune, Maharashtra',
    locality: 'Aundh',
    craft: 'Botanical Resin Keepsakes',
    rating: 4.8,
    reviewCount: 64,
    completedCreations: 180,
    joinedYear: 2023,
    story:
      'Meera forages wildflowers, rose petals, and seasonal leaves to preserve them forever inside eco-friendly non-yellowing crystal resin art and keepsake gifts.',
    verified: true,
    specialties: ['Pressed Flower Trays', 'Floral Bookmarks', 'Resin Coasters'],
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Handmade Crochet Sunflower Pot',
    price: 299,
    originalPrice: 399,
    creatorId: 'creator_1',
    creatorName: 'Ananya Mukherjee',
    creatorBrand: 'Vana Crochet Studio',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
    creatorLocation: 'Kothrud, Pune',
    category: 'Crochet',
    categoryId: 'crochet',
    images: [
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 88,
    description:
      'Brighten any desk or windowsill with this vibrant, everlasting crochet sunflower potted in a soft textured terracotta-style yarn base. Each petal is individually sculpted and crocheted using premium 100% combed cotton yarn.',
    shortDescription: 'Everlasting artisan-crocheted sunflower desk accent in textured base.',
    isEco: true,
    isTrending: true,
    isHighlyRated: true,
    isPocketFriendly: true,
    isNew: false,
    isNearYou: true,
    isGift: true,
    stock: 14,
    preparationDays: 3,
    passport: {
      origin: 'Kothrud, Pune, Maharashtra',
      craftType: 'Single & Double Crochet Needlework',
      materials: ['100% Organic Combed Cotton', 'Recycled Polyfill', 'Natural Bamboo Support Stalk'],
      hoursToCraft: '6.5 hours of artisan handcrafting',
      batchInfo: 'Handmade Small Batch #VK-2026',
      authenticityGuarantee: 'Handcrafted individually by Ananya Mukherjee. Zero factory automation.',
    },
    tags: ['Crochet', 'Sunflower', 'Desk Decor', 'Gift', 'Eco-friendly'],
  },
  {
    id: 'prod_2',
    name: 'Hand-painted Madhubani Painting',
    price: 899,
    originalPrice: 1199,
    creatorId: 'creator_2',
    creatorName: 'Sunita Devi',
    creatorBrand: 'Mithila Heritage Crafts',
    creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
    creatorLocation: 'Alandi, Pune',
    category: 'Paintings',
    categoryId: 'paintings',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.8,
    reviewCount: 54,
    description:
      'An exquisite, authentic Madhubani artwork depicting the sacred Tree of Life and dancing peacocks. Rendered on handmade recycled rag paper with natural pigments and bamboo nibs.',
    shortDescription: 'Traditional folk artwork created with natural pigments on handmade rag paper.',
    isEco: true,
    isTrending: true,
    isHighlyRated: true,
    isPocketFriendly: false,
    isNew: false,
    isNearYou: true,
    isGift: true,
    stock: 6,
    preparationDays: 5,
    passport: {
      origin: 'Alandi, Pune, Maharashtra',
      craftType: 'Mithila Bharni & Kachni Line Technique',
      materials: ['Handmade Rag Paper (300 GSM)', 'Turmeric & Marigold Natural Inks', 'Soot Black Pigment'],
      hoursToCraft: '16 hours of detailed line work',
      batchInfo: 'Unique Masterpiece Piece #SD-44',
      authenticityGuarantee: 'Certified hand-painted by master artisan Sunita Devi.',
    },
    tags: ['Madhubani', 'Painting', 'Folk Art', 'Wall Decor', 'Traditional'],
  },
  {
    id: 'prod_3',
    name: 'Resin Flower Art Trinket Tray',
    price: 499,
    originalPrice: 650,
    creatorId: 'creator_6',
    creatorName: 'Meera Sen',
    creatorBrand: 'Petal & Resin',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
    creatorLocation: 'Aundh, Pune',
    category: 'Resin Art',
    categoryId: 'resin',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.8,
    reviewCount: 42,
    description:
      'Real pressed wildflowers and gold flakes captured forever inside high-clarity resin. Ideal for bedside jewelry, vanity styling, or storing delicate rings.',
    shortDescription: 'Hand-cast oval tray featuring preserved real botanicals and warm gold accents.',
    isEco: false,
    isTrending: true,
    isHighlyRated: false,
    isPocketFriendly: true,
    isNew: true,
    isNearYou: true,
    isGift: true,
    stock: 18,
    preparationDays: 2,
    passport: {
      origin: 'Aundh, Pune, Maharashtra',
      craftType: 'Botanical Pressing & Two-Stage Resin Casting',
      materials: ['Non-Yellowing UV Resin', 'Locally Foraged Wildflowers', '24K Imitation Gold Leaf'],
      hoursToCraft: '48-hour cure and polish process',
      batchInfo: 'Studio Release #PR-88',
      authenticityGuarantee: 'Contains genuine botanical specimens hand-foraged in Pune.',
    },
    tags: ['Resin', 'Tray', 'Jewelry Dish', 'Gold Foil', 'Botanical'],
  },
  {
    id: 'prod_4',
    name: 'Woolen Flower Bouquet - Pastel Bloom',
    price: 349,
    originalPrice: 450,
    creatorId: 'creator_1',
    creatorName: 'Ananya Mukherjee',
    creatorBrand: 'Vana Crochet Studio',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
    creatorLocation: 'Kothrud, Pune',
    category: 'Woolen Flowers',
    categoryId: 'woolen',
    images: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 62,
    description:
      'A charming five-stem bouquet featuring pastel roses, lavender sprigs, and eucalyptus leaves handcrafted from soft plush woolen yarn. Finished with craft paper wrapping and jute twine.',
    shortDescription: 'Handcrafted five-stem wool flower bouquet with everlasting pastel hues.',
    isEco: true,
    isTrending: true,
    isHighlyRated: true,
    isPocketFriendly: true,
    isNew: false,
    isNearYou: true,
    isGift: true,
    stock: 12,
    preparationDays: 3,
    passport: {
      origin: 'Kothrud, Pune, Maharashtra',
      craftType: 'Multi-ply Wool Loom & Needle Weaving',
      materials: ['Merino-blend Yarn', 'Recycled Florist Wire', 'Kraft Paper Wrap'],
      hoursToCraft: '8 hours of intricate looping',
      batchInfo: 'Artisan Batch #VB-109',
      authenticityGuarantee: 'Handcrafted with zero plastic foliage. Sustainable gift.',
    },
    tags: ['Woolen Flowers', 'Bouquet', 'Handmade Gift', 'Pastel', 'Anniversary'],
  },
  {
    id: 'prod_5',
    name: 'Terracotta Glazed Kulhad & Kettle Set',
    price: 549,
    originalPrice: 699,
    creatorId: 'creator_3',
    creatorName: 'Rajesh Prajapati',
    creatorBrand: 'Mitti Kala Workshop',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    creatorLocation: 'Viman Nagar, Pune',
    category: 'Pottery',
    categoryId: 'pottery',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 94,
    description:
      'Experience authentic chai with this wheel-thrown terracotta set consisting of 4 glazed kulhads and a traditional pouring kettle. Hand-fired in a wood-kiln with food-safe earthy glaze.',
    shortDescription: 'Wheel-thrown artisanal tea set crafted from Pune riverbed clay.',
    isEco: true,
    isTrending: false,
    isHighlyRated: true,
    isPocketFriendly: false,
    isNew: false,
    isNearYou: true,
    isGift: true,
    stock: 9,
    preparationDays: 4,
    passport: {
      origin: 'Viman Nagar, Pune, Maharashtra',
      craftType: 'Kick-Wheel Throwing & Wood Kiln Firing',
      materials: ['Indrayani River Natural Clay', 'Food-Safe Mineral Glaze'],
      hoursToCraft: '18 hours including firing & cooling',
      batchInfo: 'Kiln Batch #MK-72',
      authenticityGuarantee: '100% lead-free, wheel-thrown authentic terracotta.',
    },
    tags: ['Pottery', 'Kulhad', 'Chai Set', 'Terracotta', 'Ceramics'],
  },
  {
    id: 'prod_6',
    name: 'Hand-poured Soy Candle - Saffron & Jasmine',
    price: 420,
    originalPrice: 550,
    creatorId: 'creator_4',
    creatorName: 'Priya Sharma',
    creatorBrand: 'Aura Botanica',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    creatorLocation: 'Koregaon Park, Pune',
    category: 'Candles',
    categoryId: 'candles',
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.7,
    reviewCount: 48,
    description:
      'Immerse your space in the nostalgic aroma of Indian jasmine flowers and rich Kashmiri saffron. Hand-poured using clean-burning soy wax in a reusable amber glass jar.',
    shortDescription: 'Aromatherapeutic hand-poured soy candle with wooden crackling wick.',
    isEco: true,
    isTrending: true,
    isHighlyRated: false,
    isPocketFriendly: true,
    isNew: false,
    isNearYou: true,
    isGift: true,
    stock: 22,
    preparationDays: 2,
    passport: {
      origin: 'Koregaon Park, Pune, Maharashtra',
      craftType: 'Small Batch Soy Wax Temperature Poured',
      materials: ['100% Pure Soy Wax', 'Wild Jasmine Essential Oil', 'Kashmiri Saffron Stigmas', 'Natural Wood Wick'],
      hoursToCraft: '3-stage temperature curing',
      batchInfo: 'Pour Batch #AB-310',
      authenticityGuarantee: 'Clean burning, paraffin-free, hand-poured by Priya Sharma.',
    },
    tags: ['Candles', 'Soy Wax', 'Jasmine', 'Aromatherapy', 'Home Fragrance'],
  },
  {
    id: 'prod_7',
    name: 'Botanical French Knot Embroidered Hoop',
    price: 680,
    originalPrice: 850,
    creatorId: 'creator_5',
    creatorName: 'Kavita Rao',
    creatorBrand: 'Taar Studio',
    creatorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80',
    creatorLocation: 'Baner, Pune',
    category: 'Embroidery',
    categoryId: 'embroidery',
    images: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    reviewCount: 39,
    description:
      'A mesmerizing botanical composition of wildflowers and lavender buds created with hundreds of intricate French knots on unbleached linen, framed in an 8-inch beechwood hoop.',
    shortDescription: 'Hand-embroidered French knot botanical art framed in wooden hoop.',
    isEco: true,
    isTrending: false,
    isHighlyRated: true,
    isPocketFriendly: false,
    isNew: true,
    isNearYou: true,
    isGift: true,
    stock: 7,
    preparationDays: 4,
    passport: {
      origin: 'Baner, Pune, Maharashtra',
      craftType: 'French Knot & Satin Needlework',
      materials: ['Unbleached Organic Cotton Linen', 'Anchor Egyptian Cotton Floss', 'Natural Beechwood Hoop'],
      hoursToCraft: '14 hours of continuous hand-stitching',
      batchInfo: 'Signature Creation #TR-204',
      authenticityGuarantee: 'Exclusively hand-stitched by Kavita Rao.',
    },
    tags: ['Embroidery', 'Hoop Art', 'Wall Hanging', 'Botanical', 'Decor'],
  },
  {
    id: 'prod_8',
    name: 'Handcrafted Brass & Silver Filigree Jhumkas',
    price: 799,
    originalPrice: 999,
    creatorId: 'creator_2',
    creatorName: 'Sunita Devi',
    creatorBrand: 'Mithila Heritage Crafts',
    creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
    creatorLocation: 'Alandi, Pune',
    category: 'Handmade Jewellery',
    categoryId: 'jewellery',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.8,
    reviewCount: 51,
    description:
      'Traditional oxidized silver finish jhumkas adorned with intricate wire filigree and tinkling ghungroo bells. Hypoallergenic and lightweight for all-day festive wear.',
    shortDescription: 'Artisan wire-filigree earrings with oxidized antique patina.',
    isEco: false,
    isTrending: true,
    isHighlyRated: true,
    isPocketFriendly: false,
    isNew: false,
    isNearYou: true,
    isGift: true,
    stock: 15,
    preparationDays: 2,
    passport: {
      origin: 'Alandi, Pune, Maharashtra',
      craftType: 'Traditional Wire Filigree & Soldering',
      materials: ['High-Purity Brass Alloy', 'Antique Silver Oxidation', 'Lead-Free Solder'],
      hoursToCraft: '7 hours of precision wire shaping',
      batchInfo: 'Artisan Batch #SD-J32',
      authenticityGuarantee: 'Individually wired by hand without mold duplication.',
    },
    tags: ['Jewellery', 'Jhumkas', 'Earrings', 'Ethnic', 'Handmade'],
  },
  {
    id: 'prod_9',
    name: 'Customized Family Nameplate (Resin & Teak Wood)',
    price: 1299,
    originalPrice: 1699,
    creatorId: 'creator_6',
    creatorName: 'Meera Sen',
    creatorBrand: 'Petal & Resin',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
    creatorLocation: 'Aundh, Pune',
    category: 'Customized Gifts',
    categoryId: 'gifts',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 5.0,
    reviewCount: 38,
    description:
      'A bespoke entry nameplate blending seasoned teak wood bark with shimmering ocean-blue resin. Customized with your family name, initials, and house number in gold calligraphy.',
    shortDescription: 'Personalized resin river wood nameplate for your warm home entrance.',
    isEco: true,
    isTrending: true,
    isHighlyRated: true,
    isPocketFriendly: false,
    isNew: true,
    isNearYou: true,
    isGift: true,
    stock: 8,
    preparationDays: 6,
    passport: {
      origin: 'Aundh, Pune, Maharashtra',
      craftType: 'Live-Edge Wood Planing & River Resin Pour',
      materials: ['Reclaimed Seasoned Teak Wood', 'Crystal Resin', 'Gold Leaf Inlay'],
      hoursToCraft: '22 hours over 5 curing stages',
      batchInfo: 'Custom Commission Series #PR-NP',
      authenticityGuarantee: 'Personalized by artisan Meera Sen with live-edge natural grains.',
    },
    tags: ['Customized', 'Nameplate', 'Wood Decor', 'Personalized Gift', 'Housewarming'],
  },
];

const INITIAL_STORIES: Story[] = [
  {
    id: 'story_1',
    creatorName: 'Ananya Mukherjee',
    creatorRole: 'Crochet Artist & Botanical Enthusiast',
    location: 'Kothrud, Pune',
    title: 'Weaving Sunflowers that Never Wilt',
    subtitle: 'How Ananya turned a calming grandmother’s pastime into a blossoming craft atelier.',
    content:
      'In a quiet sunlit balcony in Kothrud, surrounded by ferns and potted money plants, Ananya sits with a 3mm aluminum hook and spools of golden-yellow cotton yarn. "My grandmother taught me the basics of crochet when I was ten in Kolkata," Ananya smiles. "During busy city days, crocheting was my peaceful sanctuary. When friends began asking for sunflowers that would never wither on their office desks, Vana Crochet Studio was born."',
    quote: 'Every loop is a deliberate breath. When you hold a handmade piece, you hold hours of someone’s quiet focus.',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    workshopImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    craft: 'Crochet & Botanical Fibers',
  },
  {
    id: 'story_2',
    creatorName: 'Rajesh Prajapati',
    creatorRole: 'Master Ceramicist & Clay Alchemist',
    location: 'Viman Nagar, Pune',
    title: 'The Song of the Indrayani River Clay',
    subtitle: 'Reviving ancestral Maharashtrian pottery traditions with modern studio aesthetics.',
    content:
      'The rhythmic whoosh of Rajesh’s wooden kickwheel is the heartbeat of Mitti Kala Workshop. For Rajesh, clay is not merely mud—it is memory. Hand-digging local clay from riverbeds, filtering it through fine mesh, and coaxing it into elegant tea kulhads takes over two weeks before it touches the kiln.',
    quote: 'A factory machine produces ten thousand identical cups. The potter’s hand ensures no two cups ever tell the same story.',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    workshopImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    craft: 'Wheel-thrown Pottery',
  },
  {
    id: 'story_3',
    creatorName: 'Sunita Devi',
    creatorRole: 'Folk Heritage Artist',
    location: 'Alandi, Pune',
    title: 'Sacred Lines of Mithila in Pune',
    subtitle: 'Keeping 2,500 years of indigenous women’s folklore alive through natural pigments.',
    content:
      'Sunita’s fingers hold a slender piece of sharpened bamboo, dipped into rich black pigment rendered from mustard-oil lamp soot. Without preliminary pencil outlines, she paints flowing peacocks, lotus blossoms, and cosmic motifs directly onto textured rag paper.',
    quote: 'In our village, walls spoke our joys and prayers. Today, my paintings bring that same sacred blessing into modern Indian homes.',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    workshopImage: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
    craft: 'Traditional Madhubani',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'KG-89210',
    date: '24 Sep 2026',
    items: [
      {
        id: 'item_1',
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        customization: {
          customerName: 'Sanket Joshi',
          color: 'Sunny Golden',
          extraPrice: 0,
        },
      },
    ],
    totalAmount: 299,
    subtotal: 299,
    deliveryFee: 0,
    discount: 0,
    status: 'Ready to Ship',
    deliveryAddress: {
      name: 'Sanket Joshi',
      phone: '+91 98220 12345',
      address: 'Flat 402, Mayur Heights, Kothrud',
      city: 'Pune',
      locality: 'Kothrud',
      pincode: '411038',
    },
    paymentMethod: 'UPI (Google Pay)',
    estimatedDelivery: '28 Sep 2026',
    trackingNumber: 'DEL-PUN-982104',
    timeline: [
      {
        title: 'Order Placed & Confirmed',
        description: 'Payment verified and order shared with Ananya Mukherjee.',
        date: '24 Sep, 10:15 AM',
        completed: true,
        current: false,
      },
      {
        title: 'In the Workshop (Handcrafted)',
        description: 'Petals crocheted and assembled in the Kothrud studio.',
        date: '24 Sep, 04:30 PM',
        completed: true,
        current: false,
      },
      {
        title: 'Artisan Quality Check & Gift Packaged',
        description: 'Inspected for finish with eco-friendly honeycomb wrap.',
        date: '25 Sep, 09:00 AM',
        completed: true,
        current: true,
      },
      {
        title: 'Handed to Local Delivery Partner',
        description: 'Scheduled for courier dispatch across Pune.',
        date: 'Expected Today',
        completed: false,
        current: false,
      },
      {
        title: 'Delivered to Doorstep',
        description: 'Delivered with artisan care card.',
        date: 'Expected 28 Sep',
        completed: false,
        current: false,
      },
    ],
  },
  {
    id: 'KG-76540',
    date: '18 Sep 2026',
    items: [
      {
        id: 'item_2',
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
      },
    ],
    totalAmount: 549,
    subtotal: 549,
    deliveryFee: 0,
    discount: 0,
    status: 'Delivered',
    deliveryAddress: {
      name: 'Sanket Joshi',
      phone: '+91 98220 12345',
      address: 'Flat 402, Mayur Heights, Kothrud',
      city: 'Pune',
      locality: 'Kothrud',
      pincode: '411038',
    },
    paymentMethod: 'Cash on Delivery',
    estimatedDelivery: '21 Sep 2026',
    trackingNumber: 'DEL-PUN-765401',
    timeline: [
      {
        title: 'Delivered Successfully',
        description: 'Delivered to recipient with warm artisan regards.',
        date: '21 Sep, 02:40 PM',
        completed: true,
        current: true,
      },
    ],
  },
];

const STORAGE_KEYS = {
  wishlist: '@kaarigaar/wishlist',
  cart: '@kaarigaar/cart',
  orders: '@kaarigaar/orders',
  products: '@kaarigaar/custom_products',
  location: '@kaarigaar/selected_location',
  briefs: '@kaarigaar/custom_briefs',
} as const;

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [creators, setCreators] = useState<Creator[]>(INITIAL_CREATORS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [wishlist, setWishlist] = useState<string[]>(['prod_1', 'prod_4']);
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'cart_init_1',
      product: INITIAL_PRODUCTS[0],
      quantity: 1,
      selectedColor: 'Sunny Gold',
    },
  ]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customBriefs, setCustomBriefs] = useState<CustomBrief[]>([]);
  const [stories] = useState<Story[]>(INITIAL_STORIES);
  const [selectedLocation, setSelectedLocationState] = useState<string>('Pune');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');

  // Hydrate persisted state
  useEffect(() => {
    (async () => {
      try {
        const [wRaw, cRaw, oRaw, pRaw, locRaw, bRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.wishlist),
          AsyncStorage.getItem(STORAGE_KEYS.cart),
          AsyncStorage.getItem(STORAGE_KEYS.orders),
          AsyncStorage.getItem(STORAGE_KEYS.products),
          AsyncStorage.getItem(STORAGE_KEYS.location),
          AsyncStorage.getItem(STORAGE_KEYS.briefs),
        ]);

        if (wRaw) setWishlist(JSON.parse(wRaw));
        if (cRaw) setCart(JSON.parse(cRaw));
        if (oRaw) setOrders(JSON.parse(oRaw));
        if (locRaw) setSelectedLocationState(locRaw);
        if (bRaw) setCustomBriefs(JSON.parse(bRaw));

        if (pRaw) {
          const userProducts = JSON.parse(pRaw) as Product[];
          setProducts([...userProducts, ...INITIAL_PRODUCTS]);
        }
      } catch {
        // Fall back gracefully
      }
    })();
  }, []);

  const setSelectedLocation = (loc: string) => {
    setSelectedLocationState(loc);
    AsyncStorage.setItem(STORAGE_KEYS.location, loc).catch(() => {});
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
      AsyncStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const isWishlisted = (productId: string): boolean => {
    return wishlist.includes(productId);
  };

  const addToCart = (product: Product, quantity = 1, customization?: CustomizationDetails) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && JSON.stringify(item.customization) === JSON.stringify(customization),
      );

      let next: CartItem[];
      if (existingIdx >= 0) {
        next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
        };
      } else {
        const newItem: CartItem = {
          id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          product,
          quantity,
          customization,
          selectedColor: customization?.color,
        };
        next = [newItem, ...prev];
      }

      AsyncStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.id !== cartItemId);
      AsyncStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) => {
      const next = prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item));
      AsyncStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
    AsyncStorage.removeItem(STORAGE_KEYS.cart).catch(() => {});
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => {
      const customPrice = item.customization?.extraPrice ?? 0;
      return sum + (item.product.price + customPrice) * item.quantity;
    }, 0);
  };

  const createOrder = (
    address: Order['deliveryAddress'],
    paymentMethod: string,
    discount = 0,
  ): string => {
    const subtotal = getCartSubtotal();
    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const totalAmount = Math.max(0, subtotal + deliveryFee - discount);
    const orderId = `KG-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      date: 'Today',
      items: [...cart],
      totalAmount,
      subtotal,
      deliveryFee,
      discount,
      status: 'Processing',
      deliveryAddress: address,
      paymentMethod,
      estimatedDelivery: '3 to 5 business days',
      trackingNumber: `DEL-PUN-${Math.floor(100000 + Math.random() * 900000)}`,
      timeline: [
        {
          title: 'Order Placed & Confirmed',
          description: `Payment received via ${paymentMethod}. Maker notified.`,
          date: 'Just now',
          completed: true,
          current: true,
        },
        {
          title: 'In the Maker’s Studio',
          description: 'Being handcrafted and personalized with care.',
          date: 'Pending',
          completed: false,
          current: false,
        },
        {
          title: 'Quality Check & Packed',
          description: 'Passed artisanal finishing and packed in eco-friendly wraps.',
          date: 'Pending',
          completed: false,
          current: false,
        },
        {
          title: 'Out for Delivery',
          description: 'Dispatched with local Pune courier partner.',
          date: 'Pending',
          completed: false,
          current: false,
        },
      ],
    };

    setOrders((prev) => {
      const next = [newOrder, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(next)).catch(() => {});
      return next;
    });

    clearCart();
    return orderId;
  };

  const submitCustomBrief = (briefData: Omit<CustomBrief, 'id' | 'status' | 'createdAt'>) => {
    const newBrief: CustomBrief = {
      ...briefData,
      id: `brief_${Date.now()}`,
      status: 'Under Review',
      createdAt: 'Today',
    };

    setCustomBriefs((prev) => {
      const next = [newBrief, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.briefs, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const addNewProduct = (productData: Partial<Product>): Product => {
    const id = `prod_${Date.now()}`;
    const newProd: Product = {
      id,
      name: productData.name || 'New Handmade Creation',
      price: productData.price || 499,
      originalPrice: productData.originalPrice || Math.round((productData.price || 499) * 1.25),
      creatorId: productData.creatorId || 'creator_me',
      creatorName: productData.creatorName || 'You (Karigaar)',
      creatorBrand: productData.creatorBrand || 'Your Craft Atelier',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
      creatorLocation: 'Pune, Maharashtra',
      category: productData.category || 'Home Décor',
      categoryId: productData.categoryId || 'homedecor',
      images: productData.images && productData.images.length > 0
        ? productData.images
        : ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'],
      rating: 5.0,
      reviewCount: 1,
      description: productData.description || 'Handcrafted with dedication and care using authentic materials.',
      shortDescription: productData.shortDescription || 'Artisan handmade creation crafted in Pune.',
      isEco: Boolean(productData.isEco),
      isTrending: true,
      isHighlyRated: true,
      isPocketFriendly: (productData.price || 499) <= 499,
      isNew: true,
      isNearYou: true,
      isGift: true,
      stock: productData.stock || 10,
      preparationDays: productData.preparationDays || 3,
      passport: productData.passport || {
        origin: 'Pune, Maharashtra',
        craftType: 'Traditional Handcraft',
        materials: ['Organic & Sustainable Materials'],
        hoursToCraft: '10 hours of handcrafting',
        batchInfo: 'Handmade Batch #KG-NEW',
        authenticityGuarantee: 'Verified genuine handmade creation.',
      },
      tags: productData.tags || ['Handmade', 'Karigaar', 'Artisan'],
    };

    setProducts((prev) => {
      const next = [newProd, ...prev];
      AsyncStorage.getItem(STORAGE_KEYS.products).then((raw) => {
        const stored = raw ? JSON.parse(raw) : [];
        AsyncStorage.setItem(STORAGE_KEYS.products, JSON.stringify([newProd, ...stored])).catch(() => {});
      });
      return next;
    });

    return newProd;
  };

  const updateOrderStatus = (orderId: string, nextStatus: Order['status']) => {
    setOrders((prev) => {
      const next = prev.map((ord) => (ord.id === orderId ? { ...ord, status: nextStatus } : ord));
      AsyncStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  return (
    <MarketplaceContext.Provider
      value={{
        categories,
        creators,
        products,
        wishlist,
        cart,
        orders,
        customBriefs,
        stories,
        selectedLocation,
        activeSearchQuery,
        setSelectedLocation,
        setActiveSearchQuery,
        toggleWishlist,
        isWishlisted,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartCount,
        getCartSubtotal,
        createOrder,
        submitCustomBrief,
        addNewProduct,
        updateOrderStatus,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace(): MarketplaceContextValue {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error('useMarketplace must be used within MarketplaceProvider');
  return ctx;
}
