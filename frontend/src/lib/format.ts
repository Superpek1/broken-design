// Small display helpers shared by model cards and the model page

/** `$15`, `$8.50` (whole dollars have no decimals). */
export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;

/** `3120` -> `3,120` */
export const formatCount = (n: number) => n.toLocaleString('en-US');
