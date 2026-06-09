import reportWebVitals from "../reportWebVitals";

describe("reportWebVitals", () => {
  test("no truena si no recibe una función", () => {
    expect(() => reportWebVitals()).not.toThrow();
  });

  test("no truena si recibe un valor que no es función", () => {
    expect(() => reportWebVitals("texto")).not.toThrow();
  });

  test("no truena si recibe una función", () => {
    const onPerfEntry = jest.fn();

    expect(() => reportWebVitals(onPerfEntry)).not.toThrow();
  });
});