export const SWR_KEYS = {
  LIBRARY: "library-data",
  MY_ORDERS: "orders-data",
  STORE_DATA: "store-data",
  TOPUP_QR: "topup-qr",
  CATALOG_METADATA: "catalog-filter-metadata",
  STEAM_KEY_HERO: "steam-key-hero",
  productDetail: (slug: string | number) => `product-detail-${slug}`,
  productReviews: (productId: string | number) => `product-reviews-${productId}`,
  productRelated: (productId: string | number) => `product-related-${productId}`,
} as const;

