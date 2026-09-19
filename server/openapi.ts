export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Accessories.lt Production REST API",
    version: "1.0.0",
    description: "Production-ready, scalable e-commerce backend API for Accessories.lt supporting the full customer journey: Product Discovery, Search, Cart, Checkout, Payment Gateway & Webhooks, Orders, Shipping & Tracking, Inventory, Customer Accounts, Admin RBAC, BullMQ Background Queue, and Redis Caching."
  },
  servers: [
    { url: "/api/v1", description: "API v1 Endpoint" },
    { url: "/api", description: "Default Compatibility Endpoint" }
  ],
  paths: {
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List all products with filters, sorting, and pagination",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["featured", "newest", "price-low", "price-high", "rating", "best-selling"] } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "inStock", in: "query", schema: { type: "boolean" } }
        ],
        responses: {
          "200": { description: "Array of products and total count" }
        }
      }
    },
    "/products/{slug}": {
      get: {
        tags: ["Products"],
        summary: "Get single product with verified reviews and related products",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Product details, reviews, and related items" },
          "404": { description: "Product not found" }
        }
      }
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List all categories with active product counts",
        responses: {
          "200": { description: "Array of categories" }
        }
      }
    },
    "/search": {
      get: {
        tags: ["Search"],
        summary: "Full-text search with typo tolerance and category breakdown",
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Search results matching query" }
        }
      }
    },
    "/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get session cart with server-side price & stock verification",
        parameters: [
          { name: "x-session-id", in: "header", schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Cart state with computed subtotal, discount, shipping, and tax" }
        }
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear all items in the cart",
        responses: {
          "200": { description: "Cart emptied successfully" }
        }
      }
    },
    "/cart/items": {
      post: {
        tags: ["Cart"],
        summary: "Add product to cart or increment quantity",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  variantId: { type: "string" },
                  quantity: { type: "number", default: 1 }
                },
                required: ["productId"]
              }
            }
          }
        },
        responses: {
          "200": { description: "Item added, updated cart returned" },
          "400": { description: "Out of stock or invalid quantity" }
        }
      }
    },
    "/cart/merge": {
      post: {
        tags: ["Cart"],
        summary: "Merge guest session cart into authenticated customer account",
        responses: {
          "200": { description: "Merged cart returned" }
        }
      }
    },
    "/coupons/validate": {
      post: {
        tags: ["Coupons"],
        summary: "Validate coupon code against minimum subtotal and date range",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  subtotal: { type: "number" }
                },
                required: ["code"]
              }
            }
          }
        },
        responses: {
          "200": { description: "Coupon valid with discount details" }
        }
      }
    },
    "/checkout/session": {
      post: {
        tags: ["Checkout"],
        summary: "Create payment checkout session with client secret",
        responses: {
          "200": { description: "Session created with clientSecret and token" }
        }
      }
    },
    "/checkout": {
      post: {
        tags: ["Checkout"],
        summary: "Process checkout, lock inventory atomically, and create order",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  customer: { type: "object" },
                  shippingAddress: { type: "object" },
                  deliveryMethodId: { type: "string" },
                  paymentMethod: { type: "string" },
                  couponCode: { type: "string" },
                  items: { type: "array" }
                },
                required: ["customer", "shippingAddress", "deliveryMethodId", "paymentMethod", "items"]
              }
            }
          }
        },
        responses: {
          "201": { description: "Order created successfully" },
          "400": { description: "Inventory or validation failure" }
        }
      }
    },
    "/webhooks/payment": {
      post: {
        tags: ["Payments"],
        summary: "Receive payment provider webhooks (HMAC signature verified, idempotent)",
        parameters: [
          { name: "x-webhook-signature", in: "header", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Webhook processed" },
          "401": { description: "Invalid HMAC signature" }
        }
      }
    },
    "/orders/{orderNumber}": {
      get: {
        tags: ["Orders"],
        summary: "Track order status and carrier delivery milestones",
        parameters: [
          { name: "orderNumber", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Order details and tracking checkpoints" }
        }
      }
    },
    "/orders/{orderNumber}/return": {
      post: {
        tags: ["Orders"],
        summary: "Submit return request under 14-day EU statutory right",
        responses: {
          "200": { description: "Return ticket created and prepaid label scheduled" }
        }
      }
    },
    "/shipping/rates": {
      get: {
        tags: ["Shipping"],
        summary: "Calculate carrier rates (Omniva, DPD, Post, DHL) for order subtotal",
        responses: {
          "200": { description: "List of shipping rates" }
        }
      }
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new customer account",
        responses: {
          "201": { description: "Customer registered with JWT token" }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate customer with email and password",
        responses: {
          "200": { description: "Auth token and user details" }
        }
      }
    },
    "/me/gdpr-export": {
      get: {
        tags: ["Customer Profile"],
        summary: "Export personal data under GDPR Art. 15",
        responses: {
          "200": { description: "Complete user data in JSON format" }
        }
      }
    },
    "/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "KPI metrics, revenue, sales, low stock alerts, and audit trail",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": { description: "Dashboard summary statistics" }
        }
      }
    },
    "/admin/inventory": {
      get: {
        tags: ["Admin"],
        summary: "Current inventory levels and movements log",
        responses: {
          "200": { description: "Inventory list with alerts and movement history" }
        }
      }
    },
    "/admin/jobs": {
      get: {
        tags: ["Admin"],
        summary: "Inspect BullMQ background jobs queue state",
        responses: {
          "200": { description: "Job queue statistics and recent tasks" }
        }
      }
    },
    "/admin/cache": {
      get: {
        tags: ["Admin"],
        summary: "Inspect Redis caching layer stats and active keys",
        responses: {
          "200": { description: "Cache hits, misses, and keys" }
        }
      }
    }
  }
};
