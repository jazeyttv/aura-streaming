// Custom Badge System - Frontend Configuration
export const CUSTOM_BADGES = {
  // OG Badge (Pink/Purple)
  'og': {
    id: 'og',
    name: 'OG',
    description: 'Original supporter of the platform',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/178077b2-8b86-4f8d-927c-66ed6c1b025f/2',
    color: '#E91E63'
  },
  // VIP Badge (Pink Diamond)
  'vip': {
    id: 'vip',
    name: 'VIP',
    description: 'Very Important Person',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/e2ba99f4-6079-44d1-8c07-4ca6b58de61f/2',
    color: '#E91E63'
  },
  // Founder Badge (Crown)
  'founder': {
    id: 'founder',
    name: 'Founder',
    description: 'Platform founder',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/1687873b-cf38-412c-aad3-f9a4ce17f8b6/2',
    color: '#FFD700'
  },
  // Sub Badge 1 (Star)
  'sub1': {
    id: 'sub1',
    name: 'Subscriber',
    description: 'Platform subscriber',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/1e3b6965-2224-44d1-a67a-6d186c1fb17d/2',
    color: '#9146FF'
  },
  // Sub Badge 2 (Two Stars)
  'sub2': {
    id: 'sub2',
    name: 'Tier 2 Subscriber',
    description: 'Tier 2 subscriber',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/8d4e178c-81ec-4c71-af68-745b40733984/2',
    color: '#9146FF'
  },
  // Sub Badge 3 (Three Stars)
  'sub3': {
    id: 'sub3',
    name: 'Tier 3 Subscriber',
    description: 'Tier 3 subscriber',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/bb620b42-e0e1-4373-928e-d4a732f99ccb/2',
    color: '#9146FF'
  },
  // Premium Badge (Gem)
  'premium': {
    id: 'premium',
    name: 'Premium',
    description: 'Premium member',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/85856a4a-eb7d-4e26-a43e-d204a977ade4/2',
    color: '#00D9FF'
  },
  // Verified Badge (Check)
  'verified': {
    id: 'verified',
    name: 'Verified',
    description: 'Verified user',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/1469e9cf-14d9-4a48-a91c-81712d027439/2',
    color: '#1DA1F2'
  },
  // Turbo Badge (Lightning)
  'turbo': {
    id: 'turbo',
    name: 'Turbo',
    description: 'Turbo member',
    imageUrl: 'https://static-cdn.jtvnw.net/badges/v1/511b78a9-ab37-472f-9569-457753bbe7d3/2',
    color: '#9146FF'
  }
};

// Get all badges as array
export const getAllBadges = () => {
  return Object.values(CUSTOM_BADGES);
};

// Get badge by ID
export const getBadgeById = (badgeId) => {
  return CUSTOM_BADGES[badgeId] || null;
};

// Validate badge ID
export const isValidBadgeId = (badgeId) => {
  return badgeId in CUSTOM_BADGES;
};

export default CUSTOM_BADGES;

