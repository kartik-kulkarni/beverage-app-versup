import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  createTastingSchema,
  guestJoinSchema,
  guestRatingSchema,
  sessionStatusSchema,
} from "../validations";

describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      username: "testuser",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short username", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      username: "ab",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("createTastingSchema", () => {
  it("accepts valid tasting", () => {
    const result = createTastingSchema.safeParse({
      name: "Whisky Wednesday",
      beverages: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createTastingSchema.safeParse({
      name: "",
      beverages: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    const result = createTastingSchema.safeParse({
      name: "a".repeat(101),
      beverages: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("guestJoinSchema", () => {
  it("accepts valid guest name", () => {
    const result = guestJoinSchema.safeParse({ guest_name: "Alex" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = guestJoinSchema.safeParse({ guest_name: "" });
    expect(result.success).toBe(false);
  });
});

describe("guestRatingSchema", () => {
  it("accepts valid rating", () => {
    const result = guestRatingSchema.safeParse({
      guest_name: "Alex",
      beverage_index: 0,
      rating: 4,
      notes: "Very smooth",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null rating", () => {
    const result = guestRatingSchema.safeParse({
      guest_name: "Alex",
      beverage_index: 0,
      rating: null,
      notes: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating out of range", () => {
    const result = guestRatingSchema.safeParse({
      guest_name: "Alex",
      beverage_index: 0,
      rating: 6,
      notes: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("sessionStatusSchema", () => {
  it("accepts valid statuses", () => {
    expect(
      sessionStatusSchema.safeParse({ status: "setup" }).success
    ).toBe(true);
    expect(
      sessionStatusSchema.safeParse({ status: "in_progress" }).success
    ).toBe(true);
    expect(
      sessionStatusSchema.safeParse({ status: "completed" }).success
    ).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(
      sessionStatusSchema.safeParse({ status: "invalid" }).success
    ).toBe(false);
  });
});
