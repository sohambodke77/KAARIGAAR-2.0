export interface Creator {
  id: string;
  name: string;
  brand: string;
  location: string;
  craft: string[];
  rating: number;
  reviews: number;
  creationsCount: number;
  yearsActive: number;
  story: string;
  priceRange: string;
  aveTime: number;
}

export const CREATORS: Creator[] = [
  {
    id: 'a1',
    name: 'Ananya Mukherjee',
    brand: 'The Crochet Corner',
    location: 'Kolkata, WB',
    craft: ['Crochet', 'Woolen Flowers'],
    rating: 4.9,
    reviews: 412,
    creationsCount: 86,
    yearsActive: 7,
    story:
      'Ananya learned crochet from her grandmother in a Kolkata verandah. Every loop in her work carries a pattern she sketched as a child — now shared with families across India.',
    priceRange: '₹150 – ₹1,800',
    aveTime: 6,
  },
  {
    id: 's1',
    name: 'Sunita Devi',
    brand: 'Madhubani Arts',
    location: 'Madhubani, Bihar',
    craft: ['Paintings', 'Modern Madhubani'],
    rating: 4.8,
    reviews: 308,
    creationsCount: 54,
    yearsActive: 12,
    story:
      'Three generations of Sunita\'s family paint Madhubani. Her daughters now help her fill orders, and each canvas begins with a prayer and a fresh coat of hand-ground pigment.',
    priceRange: '₹600 – ₹12,000',
    aveTime: 10,
  },
  {
    id: 'r1',
    name: 'Ravi Jain',
    brand: 'Resin & Clay Studio',
    location: 'Jaipur, RJ',
    craft: ['Resin Art', 'Pottery'],
    rating: 4.7,
    reviews: 254,
    creationsCount: 61,
    yearsActive: 5,
    story:
      'A former schoolteacher, Ravi mixes resin and natural clay pigments in a corner of his Jaipur home. Each piece is born from a sketch and cured slowly over days.',
    priceRange: '₹300 – ₹4,500',
    aveTime: 8,
  },
  {
    id: 'm1',
    name: 'Meera Kulkarni',
    brand: 'Flora Fingers',
    location: 'Pune, MH',
    craft: ['Crochet', 'Woolen Flowers', 'Keychains'],
    rating: 4.9,
    reviews: 289,
    creationsCount: 132,
    yearsActive: 4,
    story:
      'Meera left a corporate job to turn her weekend crochet hobby into a living. Her sunflower pots and bunny keychains are small bursts of sunshine shipped all over India.',
    priceRange: '₹120 – ₹1,200',
    aveTime: 4,
  },
  {
    id: 'a2',
    name: 'Abdul Khan',
    brand: 'Khan Terracotta',
    location: 'Khurja, UP',
    craft: ['Pottery', 'Terracotta'],
    rating: 4.6,
    reviews: 178,
    creationsCount: 40,
    yearsActive: 15,
    story:
      'From the kilns of Khurja, Abdul shapes terracotta on a traditional wheel his father used. Every planter is sun-dried and fired once more before it ships.',
    priceRange: '₹250 – ₹2,800',
    aveTime: 9,
  },
  {
    id: 'k1',
    name: 'Kiran Bora',
    brand: 'Wick & Ember',
    location: 'Mumbai, MH',
    craft: ['Candles', 'Home Fragrance'],
    rating: 4.8,
    reviews: 233,
    creationsCount: 48,
    yearsActive: 3,
    story:
      'Kiran pours soy wax in small batches with sandalwood and vetiver from local suppliers. Each jar is tested twice — once for burn, once for scent.',
    priceRange: '₹280 – ₹1,400',
    aveTime: 3,
  },
  {
    id: 'l1',
    name: 'Lakshmi Iyer',
    brand: 'Silver Story',
    location: 'Jaipur, RJ',
    craft: ['Handmade Jewellery'],
    rating: 4.7,
    reviews: 345,
    creationsCount: 92,
    yearsActive: 9,
    story:
      'Lakshmi works out of Jaipur\'s jewellery lanes, hand-punching motifs into recycled silver. Her jhumkas are made to be passed down, not thrown away.',
    priceRange: '₹450 – ₹6,000',
    aveTime: 6,
  },
  {
    id: 'f1',
    name: 'Farida Sheikh',
    brand: 'Threads & Drops',
    location: 'Lucknow, UP',
    craft: ['Beaded Jewellery', 'Dreamcatchers'],
    rating: 4.5,
    reviews: 120,
    creationsCount: 38,
    yearsActive: 6,
    story:
      'Farida string-pulls beads into dreamcatchers and jewellery, a craft she learnt in her mother\'s chikankari atelier. She teaches her art to five neighbourhood girls.',
    priceRange: '₹200 – ₹1,200',
    aveTime: 5,
  },
  {
    id: 'g1',
    name: 'Gurpreet Kaur',
    brand: 'Phulkari House',
    location: 'Patiala, PB',
    craft: ['Embroidery', 'Phulkari'],
    rating: 4.8,
    reviews: 201,
    creationsCount: 33,
    yearsActive: 10,
    story:
      'Gurpreet\'s phulkari cushions keep an old Punjab tradition alive stitch by stitch. Each cushion takes a week of hand work with dense, glossy threads.',
    priceRange: '₹400 – ₹3,200',
    aveTime: 12,
  },
  {
    id: 'p1',
    name: 'Prakash Yadav',
    brand: 'Wood Whispers',
    location: 'Jodhpur, RJ',
    craft: ['Woodwork', 'Customized Gifts'],
    rating: 4.6,
    reviews: 143,
    creationsCount: 29,
    yearsActive: 8,
    story:
      'Prakash carves sheesham and mango wood in his jodhpur workshop. Name shelves and keepsakes are cut, sanded and sealed by hand — with a little dust always left behind.',
    priceRange: '₹500 – ₹5,000',
    aveTime: 7,
  },
  {
    id: 's3',
    name: "Sofia D'Souza",
    brand: 'Nest & Knot',
    location: 'Goa, GA',
    craft: ['Macramé', 'Home Décor'],
    rating: 4.7,
    reviews: 167,
    creationsCount: 44,
    yearsActive: 5,
    story:
      'Sofia knots cotton rope into wall hangings from her Goa studio, inspired by the sea breeze that dries them on her balcony.',
    priceRange: '₹350 – ₹2,600',
    aveTime: 5,
  },
  {
    id: 's2',
    name: 'Shanthi Wragg',
    brand: 'Loom Lines',
    location: 'Chennai, TN',
    craft: ['Weaving', 'Textiles'],
    rating: 4.9,
    reviews: 88,
    creationsCount: 21,
    yearsActive: 11,
    story:
      'Shanthi weaves cotton table runners on a handloom passed down from her mother. She buys yarn from co-ops so every loom hour pays a fair wage.',
    priceRange: '₹500 – ₹3,000',
    aveTime: 8,
  },
];

export function getCreator(id: string): Creator {
  return CREATORS.find((c) => c.id === id) ?? CREATORS[0];
}