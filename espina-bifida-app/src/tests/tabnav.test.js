import { render, screen, fireEvent } from "@testing-library/react";
import TabNav from "../componentes/tabnav/tabnav";

describe("TabNav", () => {
  const tabs = [
    { id: "pacientes", label: "Pacientes" },
    { id: "registro", label: "Registro" },
  ];

  test("renderiza las pestañas y marca la activa", () => {
    render(<TabNav tabs={tabs} activeTab="registro" onTabChange={() => {}} />);

    expect(screen.getByText(/Pacientes/i)).toBeInTheDocument();
    expect(screen.getByText(/Registro/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registro/i })).toHaveClass("active");
  });

  test("llama onTabChange cuando se hace click en una pestaña", () => {
    const onTabChange = jest.fn();

    render(<TabNav tabs={tabs} activeTab="pacientes" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Registro/i }));
    expect(onTabChange).toHaveBeenCalledWith("registro");
  });
});