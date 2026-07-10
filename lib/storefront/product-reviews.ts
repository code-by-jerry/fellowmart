export type ProductReview = {
  id: string;
  author: string;
  initials: string;
  avatarHue: number;
  rating: number;
  title: string;
  body: string;
  relativeDate: string;
  verified: boolean;
  helpful: number;
  images: string[];
};

export type ProductReviewSummary = {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

const REVIEW_LIBRARY: Omit<ProductReview, "id" | "images">[] = [
  {
    author: "Sarah Johnson",
    initials: "SJ",
    avatarHue: 248,
    rating: 5,
    title: "Exactly what I needed",
    body: "Build quality is excellent and delivery was faster than expected. Packaging felt premium and the product matches the photos perfectly.",
    relativeDate: "2 days ago",
    verified: true,
    helpful: 24,
  },
  {
    author: "Michael Brown",
    initials: "MB",
    avatarHue: 162,
    rating: 5,
    title: "Great value for money",
    body: "Been using it daily for two weeks — smooth performance, no issues. Would definitely buy again from this store.",
    relativeDate: "1 week ago",
    verified: true,
    helpful: 18,
  },
  {
    author: "Emily Davis",
    initials: "ED",
    avatarHue: 12,
    rating: 4,
    title: "Solid purchase overall",
    body: "Really happy with the product. Setup was easy and customer support answered my questions quickly. Minus one star only because I wanted one more color option.",
    relativeDate: "2 weeks ago",
    verified: true,
    helpful: 11,
  },
  {
    author: "Arjun Mehta",
    initials: "AM",
    avatarHue: 210,
    rating: 5,
    title: "Looks even better in person",
    body: "The finish and details are impressive. Arrived well protected. Sharing photos so others can see the real look.",
    relativeDate: "3 weeks ago",
    verified: true,
    helpful: 31,
  },
  {
    author: "Priya Sharma",
    initials: "PS",
    avatarHue: 330,
    rating: 5,
    title: "Perfect gift choice",
    body: "Bought this as a gift and it was a hit. Clean design, feels premium, and the recipient loved it.",
    relativeDate: "1 month ago",
    verified: true,
    helpful: 9,
  },
  {
    author: "James Wilson",
    initials: "JW",
    avatarHue: 45,
    rating: 4,
    title: "Reliable everyday pick",
    body: "Does everything I need without fuss. Good battery life and comfortable to use. Shipping updates were accurate too.",
    relativeDate: "1 month ago",
    verified: false,
    helpful: 6,
  },
];

const LIFESTYLE_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickReviewImages(
  seed: string,
  productImage?: string | null,
): string[][] {
  const base = hashString(seed);
  const pools = productImage
    ? [productImage, ...LIFESTYLE_IMAGES]
    : LIFESTYLE_IMAGES;

  return REVIEW_LIBRARY.map((_, index) => {
    if (index % 3 !== 0 && index % 4 !== 0) return [];
    const count = index % 4 === 0 ? 2 : 1;
    const images: string[] = [];
    for (let i = 0; i < count; i += 1) {
      images.push(pools[(base + index + i) % pools.length]);
    }
    return images;
  });
}

export function getProductReviews(input: {
  productId: string;
  productSlug: string;
  productImage?: string | null;
}): { summary: ProductReviewSummary; reviews: ProductReview[] } {
  const imageSets = pickReviewImages(
    `${input.productId}:${input.productSlug}`,
    input.productImage,
  );

  const reviews: ProductReview[] = REVIEW_LIBRARY.map((review, index) => ({
    ...review,
    id: `${input.productId}-review-${index}`,
    images: imageSets[index] ?? [],
  }));

  const total = reviews.length;
  const distribution: ProductReviewSummary["distribution"] = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let sum = 0;
  for (const review of reviews) {
    distribution[review.rating as 1 | 2 | 3 | 4 | 5] += 1;
    sum += review.rating;
  }

  return {
    summary: {
      average: Math.round((sum / total) * 10) / 10,
      total,
      distribution,
    },
    reviews,
  };
}
