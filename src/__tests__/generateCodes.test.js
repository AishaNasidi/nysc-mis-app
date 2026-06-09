import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateApplicantCodes } from "../utils/generateCodes";

vi.mock("../supabase/config", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({
      data: { rc_counter: 1, form_counter: 1 },
      error: null,
    }),
  },
}));

describe("generateApplicantCodes", () => {
  it("returns correctly formatted codes for KN state, year 2024", async () => {
    const result = await generateApplicantCodes("KN", 2024);
    expect(result.personalNumber).toBe("NG/KN/2024/001");
    expect(result.rcNumber).toBe("RC-00001");
    expect(result.idFormNumber).toBe("FORM-00001");
  });

  it("zero-pads the personal number to 3 digits", async () => {
    const result = await generateApplicantCodes("LA", 2025);
    expect(result.personalNumber).toMatch(/^NG\/LA\/2025\/\d{3}$/);
  });

  it("zero-pads RC and Form numbers to 5 digits", async () => {
    const result = await generateApplicantCodes("KN", 2024);
    expect(result.rcNumber).toMatch(/^RC-\d{5}$/);
    expect(result.idFormNumber).toMatch(/^FORM-\d{5}$/);
  });
});
