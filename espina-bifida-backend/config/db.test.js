import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockGetConnection = jest.fn();

const mockOracledb = {
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  outFormat: undefined,
  getConnection: mockGetConnection,
};

jest.unstable_mockModule("oracledb", () => ({
  default: mockOracledb,
}));

jest.unstable_mockModule("dotenv/config", () => ({}));

describe("config/db.js", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env.DB_USER = "usuario_test";
    process.env.DB_PASSWORD = "password_test";
    process.env.DB_CONNECT_STRING = "connect_test";
    process.env.TNS_ADMIN = "tns_test";
    process.env.WALLET_PASSWORD = "wallet_test";
  });

  test("configura oracledb.outFormat como OUT_FORMAT_OBJECT", async () => {
    await import("./db.js");

    expect(mockOracledb.outFormat).toBe(mockOracledb.OUT_FORMAT_OBJECT);
  });

  test("getConnection llama a oracledb.getConnection con variables de entorno", async () => {
    const fakeConnection = { execute: jest.fn() };
    mockGetConnection.mockResolvedValue(fakeConnection);

    const { getConnection } = await import("./db.js");
    const result = await getConnection();

    expect(mockGetConnection).toHaveBeenCalledWith({
      user: "usuario_test",
      password: "password_test",
      connectString: "connect_test",
      configDir: "tns_test",
      walletLocation: "tns_test",
      walletPassword: "wallet_test",
    });
    expect(result).toBe(fakeConnection);
  });

  test("getConnection propaga el error si Oracle falla", async () => {
    const error = new Error("No se pudo conectar");
    mockGetConnection.mockRejectedValue(error);

    const { getConnection } = await import("./db.js");

    await expect(getConnection()).rejects.toThrow("No se pudo conectar");
  });
});
