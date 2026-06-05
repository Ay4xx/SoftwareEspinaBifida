import React from "react";

describe("index.js", () => {
  let mockRender;
  let mockCreateRoot;
  let mockReportWebVitals;

  beforeEach(() => {
    jest.resetModules();

    mockRender = jest.fn();

    mockCreateRoot = jest.fn(() => ({
      render: mockRender,
    }));

    mockReportWebVitals = jest.fn();

    document.body.innerHTML = '<div id="root"></div>';

    jest.doMock("react-dom/client", () => ({
      __esModule: true,
      default: {
        createRoot: mockCreateRoot,
      },
      createRoot: mockCreateRoot,
    }));

    jest.doMock("../App", () => ({
      __esModule: true,
      default: function MockApp() {
        return <div data-testid="mock-app">Mock App</div>;
      },
    }));

    jest.doMock("../reportWebVitals", () => ({
      __esModule: true,
      default: mockReportWebVitals,
    }));

    jest.doMock("../index.css", () => ({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.dontMock("react-dom/client");
    jest.dontMock("../App");
    jest.dontMock("../reportWebVitals");
    jest.dontMock("../index.css");
  });

  test("crea el root de React y renderiza la App", () => {
    jest.isolateModules(() => {
      require("../index.js");
    });

    expect(mockCreateRoot).toHaveBeenCalledWith(
      document.getElementById("root")
    );

    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockReportWebVitals).toHaveBeenCalledTimes(1);
  });

  test("renderiza la aplicación dentro de React.StrictMode", () => {
    jest.isolateModules(() => {
      require("../index.js");
    });

    expect(mockRender).toHaveBeenCalledTimes(1);

    const elementoRenderizado = mockRender.mock.calls[0][0];

    expect(elementoRenderizado.type).toBe(React.StrictMode);
    expect(elementoRenderizado.props.children.type.name).toBe("MockApp");
  });
});