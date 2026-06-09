import base64
import json
import subprocess
import sys
from pathlib import Path

import pytest

from scripts import generate_pdf


def sample_stats():
    return {
        "pacientes": {
            "total": 10,
            "vivos": 9,
            "fallecidos": 1,
            "nuevos_mes": 2,
            "con_valvula": 3,
            "con_padecimientos": 8,
        },
        "citas": {
            "total": 20,
            "atendidas": 15,
            "canceladas": 3,
            "pendientes": 2,
        },
        "visitas": {
            "total": 30,
            "mes": 5,
            "ingresos_totales": 10000,
            "descuentos_totales": 1000,
            "ingreso_promedio": 300,
            "porcentaje_pago": 80,
        },
        "membresias": {
            "activas": 7,
            "inactivas": 2,
            "vencidas": 1,
        },
        "medicinas": {
            "total": 12,
            "stock_total": 100,
            "bajo_stock": 2,
            "valor_inventario": 5000,
            "utilizadas": 25,
            "actualizaciones_inventario": 4,
        },
        "equipo": {
            "total": 6,
            "cantidad_total": 14,
            "en_uso": 3,
            "regresados": 2,
            "porcentaje_retorno": 66,
            "valor_total": 12000,
        },
        "notificaciones": {
            "mes": 4,
            "rechazados": 1,
            "tasa_aprobacion": 75,
        },
        "series": {
            "pacientesNuevosMes": [
                {"mes": "2026-05", "total": 1},
                {"mes": "2026-06", "total": 2},
            ],
            "citasMes": [
                {"mes": "2026-05", "total": 10},
                {"mes": "2026-06", "total": 20},
            ],
            "citasAtendidasMes": [
                {"mes": "2026-05", "total": 8},
                {"mes": "2026-06", "total": 15},
            ],
            "citasCanceladasMes": [
                {"mes": "2026-05", "total": 1},
                {"mes": "2026-06", "total": 3},
            ],
            "ingresosMes": [
                {"mes": "2026-05", "total": 5000},
                {"mes": "2026-06", "total": 7000},
            ],
            "descuentosMes": [
                {"mes": "2026-05", "total": 500},
                {"mes": "2026-06", "total": 800},
            ],
            "visitasMes": [
                {"mes": "2026-05", "total": 4},
                {"mes": "2026-06", "total": 6},
            ],
            "serviciosMes": [
                {"mes": "2026-05", "total": 3},
                {"mes": "2026-06", "total": 5},
            ],
            "medicinasUtilizadasMes": [
                {"mes": "2026-05", "total": 10},
                {"mes": "2026-06", "total": 15},
            ],
            "notificacionesMes": [
                {"mes": "2026-05", "total": 2},
                {"mes": "2026-06", "total": 4},
            ],
        },
    }


def test_fmt_formats_integer_values():
    assert generate_pdf.fmt(1000) == "1,000"
    assert generate_pdf.fmt("abc") == "abc"


def test_fmt_money_formats_integer_values():
    assert generate_pdf.fmt_money(1500) == "$1,500"
    assert generate_pdf.fmt_money("no-numero") == "no-numero"


def test_make_styles_contains_expected_styles():
    styles = generate_pdf.make_styles()

    assert "title" in styles
    assert "subtitle" in styles
    assert "section" in styles
    assert "body" in styles
    assert "kpi_label" in styles
    assert "kpi_value" in styles


def test_generate_pdf_returns_pdf_bytes():
    result = generate_pdf.generate(json.dumps(sample_stats()))

    assert isinstance(result, bytes)
    assert result.startswith(b"%PDF")


def test_generate_pdf_works_with_empty_payload():
    result = generate_pdf.generate(json.dumps({}))

    assert isinstance(result, bytes)
    assert result.startswith(b"%PDF")


def test_generate_pdf_with_partial_payload():
    payload = {
        "pacientes": {
            "total": 3,
            "vivos": 3,
            "fallecidos": 0,
            "nuevos_mes": 1,
            "con_valvula": 1,
            "con_padecimientos": 2,
        }
    }

    result = generate_pdf.generate(json.dumps(payload))

    assert isinstance(result, bytes)
    assert result.startswith(b"%PDF")


def test_generate_pdf_raises_error_with_invalid_json():
    with pytest.raises(json.JSONDecodeError):
        generate_pdf.generate("{json-invalido}")


def test_bar_chart_returns_matplotlib_figure():
    fig = generate_pdf.bar_chart(
        labels=["2026-05", "2026-06"],
        datasets=[("Total", [10, 20])],
        title="Prueba",
    )

    assert fig is not None
    assert len(fig.axes) == 1


def test_line_chart_returns_matplotlib_figure():
    fig = generate_pdf.line_chart(
        labels=["2026-05", "2026-06"],
        datasets=[("Total", [10, 20])],
        title="Prueba",
    )

    assert fig is not None
    assert len(fig.axes) == 1


def test_pie_chart_returns_matplotlib_figure():
    fig = generate_pdf.pie_chart(
        labels=["Activas", "Inactivas"],
        values=[7, 3],
        title="Prueba",
    )

    assert fig is not None
    assert len(fig.axes) == 1


def test_generate_pdf_cli_outputs_base64_pdf():
    payload = json.dumps(sample_stats())
    script_path = Path(generate_pdf.__file__).resolve()

    completed = subprocess.run(
        [sys.executable, str(script_path)],
        input=payload,
        text=True,
        capture_output=True,
        check=True,
    )

    decoded = base64.b64decode(completed.stdout)

    assert decoded.startswith(b"%PDF")