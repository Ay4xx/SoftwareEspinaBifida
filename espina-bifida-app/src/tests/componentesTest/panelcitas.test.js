import { render, screen, fireEvent } from "@testing-library/react";
import PanelCitas from "../../componentes/agendacitas/panelcitas";

const mockCitas = [
  {
    id_cita: 1,
    nombre: "Ana",
    apellido: "López",
    motivo: "Consulta general",
    hora_cita: "09:00",
    telefono: "5512345678",
    estatus_cita: "PENDIENTE",
  },
  {
    id_cita: 2,
    nombre: "Juan",
    apellido: "Pérez",
    motivo: "Control",
    hora_cita: "10:30",
    telefono: "5598765432",
    estatus_cita: "ATENDIDA",
  },
];

describe("PanelCitas", () => {
  test("muestra las estadísticas y el listado de citas", () => {
    render(
      <PanelCitas
        selectedDate={new Date("2026-05-28")}
        citas={mockCitas}
        onAddPatient={() => {}}
        onDeleteAppointment={() => {}}
        onStatusChange={() => {}}
      />
    );

    expect(screen.getByText(/mayo de 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/2 citas en total/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Pendientes/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Atendidas/i)).toBeInTheDocument();
    expect(screen.getByText(/Ana López/i)).toBeInTheDocument();
    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
  });

  test("llama onAddPatient cuando se presiona el botón Agregar Paciente", () => {
    const onAddPatient = jest.fn();

    render(
      <PanelCitas
        selectedDate={new Date()}
        citas={[]}
        onAddPatient={onAddPatient}
        onDeleteAppointment={() => {}}
        onStatusChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText(/Agregar Cita/i));
    expect(onAddPatient).toHaveBeenCalled();
  });

  test("llama onStatusChange cuando cambia el estado de una cita", () => {
    const onStatusChange = jest.fn();

    render(
      <PanelCitas
        selectedDate={new Date()}
        citas={[mockCitas[0]]}
        onAddPatient={() => {}}
        onDeleteAppointment={() => {}}
        onStatusChange={onStatusChange}
      />
    );

    const [statusSelect] = screen.getAllByRole("combobox");
    fireEvent.change(statusSelect, {
      target: { value: "ATENDIDA" },
    });

    expect(onStatusChange).toHaveBeenCalledWith(1, "ATENDIDA");
  });

  test("llama onDeleteAppointment al borrar una cita", () => {
    const onDeleteAppointment = jest.fn();

    const { container } = render(
      <PanelCitas
        selectedDate={new Date()}
        citas={[mockCitas[0]]}
        onAddPatient={() => {}}
        onDeleteAppointment={onDeleteAppointment}
        onStatusChange={() => {}}
      />
    );

    const deleteButton = container.querySelector(".delete-btn");
    fireEvent.click(deleteButton);

    expect(onDeleteAppointment).toHaveBeenCalledWith(1);
  });
});