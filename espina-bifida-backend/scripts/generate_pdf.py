import sys
import json
import io
import base64
import traceback

print(">>> PYTHON SCRIPT STARTED", file=sys.stderr, flush=True)

try:

    import matplotlib
    matplotlib.use("Agg")

    print(">>> Matplotlib loaded", file=sys.stderr, flush=True)

    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    import numpy as np

    print(">>> Numpy + pyplot loaded", file=sys.stderr, flush=True)

    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, Image, KeepTogether, PageBreak
    )
    from reportlab.lib.colors import HexColor

    print(">>> ReportLab loaded", file=sys.stderr, flush=True)

except Exception as e:
    print("!!! IMPORT ERROR !!!", file=sys.stderr, flush=True)
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)

C_DARK   = HexColor("#0F172A")
C_MID    = HexColor("#1E3A5F")
C_BLUE   = HexColor("#2563EB")
C_TEAL   = HexColor("#059669")
C_AMBER  = HexColor("#D97706")
C_RED    = HexColor("#DC2626")
C_PURPLE = HexColor("#7C3AED")
C_LBLUE  = HexColor("#DBEAFE")
C_LGREEN = HexColor("#DCFCE7")
C_LAMBER = HexColor("#FEF3C7")
C_LRED   = HexColor("#FEE2E2")
C_BG     = HexColor("#F8FAFC")
C_BORDER = HexColor("#CBD5E1")
C_TEXT   = HexColor("#334155")
C_MUTED  = HexColor("#64748B")
C_WHITE  = colors.white
C_ALTROW = HexColor("#F1F5F9")

def fmt(n):
    try:
        return f"{int(n):,}"
    except:
        return str(n)

def fmt_money(n):
    try:
        return f"${int(n):,}"
    except:
        return str(n)

def make_styles():
    print(">>> Creating styles", file=sys.stderr, flush=True)

    base = getSampleStyleSheet()

    return {
        "title": ParagraphStyle(
            "title",
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=C_DARK,
            spaceAfter=4,
            leading=22
        ),

        "subtitle": ParagraphStyle(
            "subtitle",
            fontName="Helvetica",
            fontSize=10,
            textColor=C_MUTED,
            spaceAfter=12
        ),

        "section": ParagraphStyle(
            "section",
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=C_WHITE,
            spaceAfter=6,
            leading=16
        ),

        "body": ParagraphStyle(
            "body",
            fontName="Helvetica",
            fontSize=9,
            textColor=C_TEXT,
            leading=13
        ),

        "kpi_label": ParagraphStyle(
            "kpi_label",
            fontName="Helvetica",
            fontSize=8,
            textColor=C_MUTED
        ),

        "kpi_value": ParagraphStyle(
            "kpi_value",
            fontName="Helvetica-Bold",
            fontSize=14,
            textColor=C_DARK
        ),
    }

def section_heading(text, st):

    print(f">>> Creating section heading: {text}", file=sys.stderr, flush=True)

    data = [[Paragraph(text, st["section"])]]

    t = Table(data, colWidths=[6.5*inch])

    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), C_MID),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
    ]))

    return t

def kpi_table(kpis, st, accent=C_LBLUE, cols=3):

    print(">>> Creating KPI table", file=sys.stderr, flush=True)

    per_row = cols
    rows = []
    current = []

    for label, value in kpis:

        cell = Table([
            [Paragraph(label, st["kpi_label"])],
            [Paragraph(value, st["kpi_value"])],
        ], colWidths=[6.5*inch/per_row - 0.1*inch])

        cell.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), accent),
            ("TOPPADDING",    (0,0), (-1,-1), 8),
            ("BOTTOMPADDING", (0,0), (-1,-1), 8),
            ("LEFTPADDING",   (0,0), (-1,-1), 10),
            ("RIGHTPADDING",  (0,0), (-1,-1), 10),
        ]))

        current.append(cell)

        if len(current) == per_row:
            rows.append(current)
            current = []

    if current:
        while len(current) < per_row:
            current.append("")
        rows.append(current)

    col_w = [6.5*inch/per_row] * per_row

    t = Table(rows, colWidths=col_w, rowHeights=None)

    t.setStyle(TableStyle([
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING",   (0,0), (-1,-1), 4),
        ("RIGHTPADDING",  (0,0), (-1,-1), 4),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))

    return t

def chart_to_image(fig, width=6.5, height=3.2):

    print(">>> Rendering chart image", file=sys.stderr, flush=True)

    buf = io.BytesIO()

    fig.savefig(
        buf,
        format="png",
        dpi=150,
        bbox_inches="tight",
        facecolor="white",
        edgecolor="none"
    )

    plt.close(fig)

    buf.seek(0)

    img = Image(
        buf,
        width=width*inch,
        height=height*inch
    )

    return img

PALETTE = [
    "#2563EB",
    "#059669",
    "#D97706",
    "#DC2626",
    "#7C3AED",
    "#0891B2"
]

def bar_chart(labels, datasets, title, figsize=(7,3)):

    print(f">>> Building chart: {title}", file=sys.stderr, flush=True)

    fig, ax = plt.subplots(figsize=figsize)

    x = np.arange(len(labels))
    n = len(datasets)
    w = 0.7 / n

    for i, (name, vals) in enumerate(datasets):

        ax.bar(
            x + i*w - (n-1)*w/2,
            vals,
            w,
            label=name,
            color=PALETTE[i % len(PALETTE)]
        )

    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45, ha="right")

    ax.set_title(title)

    plt.tight_layout()

    return fig

def generate(stats_json: str) -> bytes:

    print(">>> START GENERATE()", file=sys.stderr, flush=True)

    data = json.loads(stats_json)

    print(">>> JSON loaded", file=sys.stderr, flush=True)

    pacientes = data.get("pacientes", {})
    series = data.get("series", {})

    st = make_styles()

    print(">>> Styles created", file=sys.stderr, flush=True)

    buf = io.BytesIO()

    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    print(">>> PDF document initialized", file=sys.stderr, flush=True)

    story = []

    def sp(n=8):
        return Spacer(1, n)

    print(">>> Adding portada", file=sys.stderr, flush=True)

    story.append(sp(20))
    story.append(Paragraph("Reporte Mensual", st["title"]))
    story.append(Paragraph("Estadísticas generales", st["subtitle"]))

    story.append(HRFlowable(
        width="100%",
        thickness=1.5,
        color=C_MID,
        spaceAfter=16
    ))

    print(">>> Adding pacientes section", file=sys.stderr, flush=True)

    story.append(section_heading("1. Pacientes", st))

    story.append(sp(8))

    story.append(kpi_table([
        ("Total pacientes", fmt(pacientes.get("total",0))),
        ("Pacientes vivos", fmt(pacientes.get("vivos",0))),
        ("Pacientes fallecidos", fmt(pacientes.get("fallecidos",0))),
    ], st))

    story.append(sp(14))

    pac_serie = series.get("pacientesNuevosMes", [])

    print(
        f">>> pacientesNuevosMes length: {len(pac_serie)}",
        file=sys.stderr,
        flush=True
    )

    if pac_serie:

        labels = [r.get("mes","") for r in pac_serie]
        vals   = [r.get("total",0) for r in pac_serie]

        fig = bar_chart(
            labels,
            [("Pacientes nuevos", vals)],
            "Pacientes nuevos por mes"
        )

        story.append(chart_to_image(fig))

    print(">>> Starting PDF build()", file=sys.stderr, flush=True)

    doc.build(story)

    print(">>> PDF build finished", file=sys.stderr, flush=True)

    pdf_data = buf.getvalue()

    print(
        f">>> PDF size: {len(pdf_data)} bytes",
        file=sys.stderr,
        flush=True
    )

    return pdf_data


if __name__ == "__main__":

    try:

        print(">>> MAIN START", file=sys.stderr, flush=True)

        raw = sys.stdin.read()

        print(
            f">>> Input length: {len(raw)}",
            file=sys.stderr,
            flush=True
        )

        result = generate(raw)

        print(">>> Encoding base64", file=sys.stderr, flush=True)

        encoded = base64.b64encode(result)

        print(
            f">>> Base64 size: {len(encoded)}",
            file=sys.stderr,
            flush=True
        )

        sys.stdout.buffer.write(encoded)

        print(">>> SCRIPT FINISHED SUCCESSFULLY", file=sys.stderr, flush=True)

    except Exception as e:

        print("\n!!! FATAL ERROR !!!", file=sys.stderr, flush=True)

        traceback.print_exc(file=sys.stderr)

        sys.exit(1)