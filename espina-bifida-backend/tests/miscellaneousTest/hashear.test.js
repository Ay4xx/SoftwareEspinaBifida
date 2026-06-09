import { jest, describe, it, expect, afterEach } from "@jest/globals";

const mockHash = jest.fn();

jest.unstable_mockModule("bcrypt", () => ({
  default: { hash: mockHash },
}));

describe("hashear.js", () => {
  afterEach(() => jest.restoreAllMocks());

  it("hashea Espina1234 con 10 salt rounds e imprime el hash", async () => {
    mockHash.mockResolvedValue("hash_generado");
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await import("../../hashear.js");

    expect(mockHash).toHaveBeenCalledWith("Espina1234", 10);
    expect(logSpy).toHaveBeenCalledWith("hash_generado");
  });
});
