import React from "react";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  NotificacionesProvider,
  useNotificaciones,
} from "../../pantallas/notificacionesContext";

function TestConsumer() {
  const { pendientesCount, setPendientesCount, refrescarBadge } =
    useNotificaciones();

  return (
    <div>
      <span data-testid="pendientes-count">{pendientesCount}</span>

      <button onClick={() => setPendientesCount(99)}>
        Cambiar contador
      </button>

      <button onClick={refrescarBadge}>
        Refrescar badge
      </button>
    </div>
  );
}

class MockEventSource {
  static instances = [];

  constructor(url) {
    this.url = url;
    this.onmessage = null;
    this.onerror = null;
    this.close = jest.fn();

    MockEventSource.instances.push(this);
  }
}

describe("notificacionesContext.jsx", () => {
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    MockEventSource.instances = [];
    global.EventSource = MockEventSource;

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        ok: true,
        data: [
          { id: 1, estado: "pendiente" },
          { id: 2, estado: "aprobado" },
          { id: 3, estado: "PENDIENTE" },
          { id: 4, estado: "rechazado" },
        ],
      }),
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    delete global.EventSource;
    delete global.fetch;
  });

  test("debe iniciar el contador en 0 y después cargar pendientes desde fetch", async () => {
    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    expect(screen.getByTestId("pendientes-count")).toHaveTextContent("0");

    await waitFor(() => {
      expect(screen.getByTestId("pendientes-count")).toHaveTextContent("2");
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/notificaciones"
    );
  });

  test("debe ignorar fetchPendientes si el usuario es invitado", async () => {
    localStorage.setItem("guest", "true");

    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    expect(screen.getByTestId("pendientes-count")).toHaveTextContent("0");

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });

    expect(MockEventSource.instances).toHaveLength(0);
  });

  test("debe permitir cambiar pendientesCount desde setPendientesCount", async () => {
  render(
    <NotificacionesProvider>
      <TestConsumer />
    </NotificacionesProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId("pendientes-count")).toHaveTextContent("2");
  });

  fireEvent.click(screen.getByText("Cambiar contador"));

  await waitFor(() => {
    expect(screen.getByTestId("pendientes-count")).toHaveTextContent("99");
  });
});

  test("debe refrescar badge manualmente", async () => {
    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("pendientes-count")).toHaveTextContent("2");
    });

    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        ok: true,
        data: [
          { id: 1, estado: "pendiente" },
          { id: 2, estado: "pendiente" },
          { id: 3, estado: "pendiente" },
        ],
      }),
    });

    screen.getByText("Refrescar badge").click();

    await waitFor(() => {
      expect(screen.getByTestId("pendientes-count")).toHaveTextContent("3");
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("debe refrescar badge cuando se dispara evento usuario-login", async () => {
    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("pendientes-count")).toHaveTextContent("2");
    });

    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        ok: true,
        data: [{ id: 10, estado: "pendiente" }],
      }),
    });

    act(() => {
      window.dispatchEvent(new Event("usuario-login"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("pendientes-count")).toHaveTextContent("1");
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("debe crear EventSource con la URL correcta", async () => {
    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    expect(MockEventSource.instances[0].url).toBe(
      "http://localhost:3001/api/notificaciones-sse"
    );
  });

  test("debe refrescar badge cuando llega mensaje SSE tipo actualizar", async () => {
    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("pendientes-count")).toHaveTextContent("2");
    });

    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        ok: true,
        data: [{ id: 1, estado: "pendiente" }],
      }),
    });

    act(() => {
      MockEventSource.instances[0].onmessage({
        data: JSON.stringify({ tipo: "actualizar" }),
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("pendientes-count")).toHaveTextContent("1");
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("no debe refrescar badge si el mensaje SSE no es tipo actualizar", async () => {
    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("pendientes-count")).toHaveTextContent("2");
    });

    act(() => {
      MockEventSource.instances[0].onmessage({
        data: JSON.stringify({ tipo: "otro" }),
      });
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("debe mostrar error si el mensaje SSE no es JSON válido", async () => {
    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    act(() => {
      MockEventSource.instances[0].onmessage({
        data: "json-invalido",
      });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[SSE] Error al parsear mensaje:",
      expect.any(Error)
    );
  });

  test("debe mostrar warning si EventSource falla", async () => {
    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    act(() => {
      MockEventSource.instances[0].onerror();
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "[SSE] Conexión perdida, reintentando..."
    );
  });

  test("debe cerrar EventSource al desmontar el provider", async () => {
    const { unmount } = render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    const instance = MockEventSource.instances[0];

    unmount();

    expect(instance.close).toHaveBeenCalledTimes(1);
  });

  test("debe mostrar error si fetch falla", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Error fetch"));

    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Badge] Error al obtener notificaciones:",
        expect.any(Error)
      );
    });

    expect(screen.getByTestId("pendientes-count")).toHaveTextContent("0");
  });

  test("no debe actualizar contador si result.ok es false", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        ok: false,
        data: [{ id: 1, estado: "pendiente" }],
      }),
    });

    render(
      <NotificacionesProvider>
        <TestConsumer />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("pendientes-count")).toHaveTextContent("0");
  });
});