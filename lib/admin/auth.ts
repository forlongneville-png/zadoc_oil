// ROUTE: lib/admin/auth.ts   (NEW FILE)
// Server-side gate for the internal /add_products tool. The client keeps a
// password in sessionStorage once unlocked and sends it back as a header on
// every write call — this is the check that actually matters, since the
// client-side gate alone can be bypassed with a raw curl request.
export function isAddProductsRequestAllowed(req: Request): boolean {
  const header = req.headers.get('x-zadoc-admin-password');
  return !!header && !!process.env.ADD_PRODUCTS_PASSWORD && header === process.env.ADD_PRODUCTS_PASSWORD;
}