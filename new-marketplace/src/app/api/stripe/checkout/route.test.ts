import { NextRequest } from "next/server";
import { POST } from "./route";
import { getSessionUser } from "../../../../lib/auth0-utils";
import { prisma } from "../../../../lib/prisma";
import { stripe } from "../../../../lib/stripe";
import { headers } from "next/headers";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => body,
    }),
    redirect: (url: string, status?: number) => ({
      status: status || 303,
      headers: new Map([["location", url]]),
    }),
  },
}));

jest.mock("../../../../lib/auth0-utils", () => ({
  getSessionUser: jest.fn(),
}));

jest.mock("../../../../lib/prisma", () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("../../../../lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

function createMockRequest(cartItems: any) {
  return {
    formData: async () => ({
      get: (key: string) => {
        if (key === "cartItems" && cartItems) {
          return JSON.stringify(cartItems);
        }
        return null;
      },
    }),
  } as unknown as NextRequest;
}

describe("POST /api/stripe/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (headers as jest.Mock).mockResolvedValue(
      new Map([["origin", "http://localhost:3000"]]),
    );
  });

  it("should return 401 Unauthorized if user is not logged in", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest([{ id: "prod_1", quantity: 1 }]);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain("Unauthorized");
  });

  it("should return 500 if cart is empty", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ sub: "auth0|123" });
    const req = createMockRequest([]); // Boş sepet

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Sepetinizde ürün bulunmamaktadır.");
  });

  it("should redirect to Stripe Checkout URL when successful", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ sub: "auth0|123" });
    const req = createMockRequest([
      { id: "prod_1", quantity: 2, name: "T-Shirt" },
    ]);

    (prisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: "prod_1", stripePriceId: "price_123abc" },
    ]);

    const mockStripeUrl = "https://checkout.stripe.com/pay/cs_test_123";
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
      url: mockStripeUrl,
    });

    const response = await POST(req);

    expect(response.status).toBe(303);

    expect(response.headers.get("location")).toBe(mockStripeUrl);
  });
});
