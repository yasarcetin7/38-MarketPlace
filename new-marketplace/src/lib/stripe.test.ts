jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock("server-only", () => ({}));

import { stripe } from "./stripe";

describe("Stripe Library Setup", () => {
  it("should successfully initialize and export the stripe instance", () => {
    expect(stripe).toBeDefined();
  });
});
