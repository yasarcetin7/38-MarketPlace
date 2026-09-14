import {
  AppRole,
  hasRole,
  requireAdmin,
  requireUser,
  type Auth0SessionUser,
} from "./auth0-utils";
import { auth0 } from "./auth0";
import { redirect } from "next/navigation";
jest.mock("./auth0", () => ({
  auth0: {
    getSession: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const ROLES_CLAIM = "https://pyp-admin/roles";

//Auth0 role test
function userWithRoles(roles: unknown): Auth0SessionUser {
  return { sub: "auth0|123", [ROLES_CLAIM]: roles };
}

describe("hasRole", () => {
  it("should return true when the user has the give role", () => {
    expect(hasRole(userWithRoles(["admin"]), AppRole.ADMIN)).toBe(true);
  });

  it("should return false when the user is missing the given role", () => {
    expect(hasRole(userWithRoles(["user", "super-admin"]), AppRole.ADMIN)).toBe(
      false,
    );
  });
});

//Auth0 Admin role test
describe("requireAdmin", () => {
  it("should return the user when the user is an admin", async () => {
    (auth0.getSession as jest.Mock).mockResolvedValue({
      user: userWithRoles(["admin"]),
    });

    const result = await requireAdmin();

    expect(result).toEqual(userWithRoles(["admin"]));
  });
  it("should redirect to forbidden when the user is not an admin", async () => {
    (auth0.getSession as jest.Mock).mockResolvedValue({
      user: userWithRoles(["user"]),
    });

    await requireAdmin();

    expect(redirect).toHaveBeenCalledWith("/forbidden");
  });
});

//Auth0 User role test
describe("requireUser", () => {
  it("should return the user when the user is logged in", async () => {
    (auth0.getSession as jest.Mock).mockResolvedValue({
      user: userWithRoles(["user"]),
    });

    const result = await requireUser();

    expect(result).toEqual(userWithRoles(["user"]));
  });

  it("should redirect to login when there is no user", async () => {
    (auth0.getSession as jest.Mock).mockResolvedValue(null);

    await requireUser();

    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });
});
