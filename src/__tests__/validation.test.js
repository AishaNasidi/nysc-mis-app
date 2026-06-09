import { describe, it, expect } from "vitest";
import { z } from "zod";

const registrationSchema = z.object({
  surname: z.string().min(1, "Surname is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female"], { errorMap: () => ({ message: "Select gender" }) }),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]),
  stateOfOrigin: z.string().min(1, "State of origin is required"),
  lgaOfOrigin: z.string().min(1, "LGA of origin is required"),
  hometown: z.string().min(1, "Hometown is required"),
  residentialAddress: z.string().min(5, "Address is required"),
  stateOfResidence: z.string().min(1, "State of residence is required"),
  lgaOfResidence: z.string().min(1, "LGA of residence is required"),
  phoneNumber: z.string().regex(/^0[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  occupation: z.string().min(1, "Occupation is required"),
  nextOfKinName: z.string().min(1, "Next of kin name is required"),
  nextOfKinAddress: z.string().min(5, "Next of kin address is required"),
  nextOfKinPhone: z.string().regex(/^0[789][01]\d{8}$/, "Enter a valid phone number"),
});

const validData = {
  surname: "Adeyemi",
  firstName: "Chukwuemeka",
  middleName: "James",
  dateOfBirth: "2000-05-15",
  gender: "Male",
  bloodGroup: "O+",
  maritalStatus: "Single",
  stateOfOrigin: "Kano",
  lgaOfOrigin: "Kano Municipal",
  hometown: "Kano",
  residentialAddress: "12 Main Street, Kano",
  stateOfResidence: "Lagos",
  lgaOfResidence: "Ikeja",
  phoneNumber: "08012345678",
  occupation: "Engineer",
  nextOfKinName: "Adeyemi Fatima",
  nextOfKinAddress: "15 Circle Road, Kano",
  nextOfKinPhone: "08087654321",
};

describe("Registration Zod Schema", () => {
  it("passes validation with all valid fields", () => {
    const result = registrationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when surname is missing", () => {
    const result = registrationSchema.safeParse({ ...validData, surname: "" });
    expect(result.success).toBe(false);
    const msgs = result.error.issues.map((i) => i.message);
    expect(msgs).toContain("Surname is required");
  });

  it("fails for invalid Nigerian phone number", () => {
    const result = registrationSchema.safeParse({ ...validData, phoneNumber: "12345" });
    expect(result.success).toBe(false);
    const msgs = result.error.issues.map((i) => i.message);
    expect(msgs).toContain("Enter a valid Nigerian phone number");
  });

  it("fails for invalid blood group", () => {
    const result = registrationSchema.safeParse({ ...validData, bloodGroup: "Z+" });
    expect(result.success).toBe(false);
    expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it("allows middleName to be optional", () => {
    const { middleName: _, ...withoutMiddle } = validData;
    const result = registrationSchema.safeParse(withoutMiddle);
    expect(result.success).toBe(true);
  });
});
