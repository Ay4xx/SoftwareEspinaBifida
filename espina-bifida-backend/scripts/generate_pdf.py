import sys
import json
import io
import base64
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
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
    try: return f"{int(n):,}"
    except: return str(n)

def fmt_money(n):
    try: return f"${int(n):,}"
    except: return str(n)

def make_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=18,
                                 textColor=C_DARK, spaceAfter=4, leading=22),
        "subtitle": ParagraphStyle("subtitle", fontName="Helvetica", fontSize=10,
                                    textColor=C_MUTED, spaceAfter=12),
        "section": ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=12,
                                   textColor=C_WHITE, spaceAfter=6, leading=16),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9,
                                textColor=C_TEXT, leading=13),
        "kpi_label": ParagraphStyle("kpi_label", fontName="Helvetica", fontSize=8,
                                     textColor=C_MUTED),
        "kpi_value": ParagraphStyle("kpi_value", fontName="Helvetica-Bold", fontSize=14,
                                     textColor=C_DARK),
    }

def section_heading(text, st):
    data = [[Paragraph(text, st["section"])]]
    t = Table(data, colWidths=[6.5*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), C_MID),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("ROUNDEDCORNERS", [4]),
    ]))
    return t

def kpi_table(kpis, st, accent=C_LBLUE, cols=3):
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
            ("ROUNDEDCORNERS", [6]),
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

def data_table(headers, rows, money_cols=None, col_widths=None):
    money_cols = money_cols or []
    n = len(headers)
    col_widths = col_widths or ([6.5*inch / n] * n)

    header_row = [Paragraph(f"<b>{h}</b>", ParagraphStyle(
        "th", fontName="Helvetica-Bold", fontSize=8, textColor=C_WHITE, alignment=TA_CENTER
    )) for h in headers]

    table_data = [header_row]
    for ri, row in enumerate(rows):
        table_data.append([
            Paragraph(str(v), ParagraphStyle(
                "td", fontName="Helvetica", fontSize=8, textColor=C_TEXT,
                alignment=TA_RIGHT if i > 0 else TA_LEFT
            ))
            for i, v in enumerate(row)
        ])

    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ("BACKGROUND",    (0, 0), (-1, 0),  C_MID),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  C_WHITE),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("GRID",          (0, 0), (-1, -1), 0.5, C_BORDER),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]
    for ri in range(1, len(table_data)):
        if ri % 2 == 0:
            style_cmds.append(("BACKGROUND", (0, ri), (-1, ri), C_ALTROW))
    t.setStyle(TableStyle(style_cmds))
    return t

def chart_to_image(fig, width=6.5, height=3.2):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight",
                facecolor="white", edgecolor="none")
    plt.close(fig)
    buf.seek(0)
    img = Image(buf, width=width*inch, height=height*inch)
    return img

PALETTE = ["#2563EB","#059669","#D97706","#DC2626","#7C3AED","#0891B2"]

def bar_chart(labels, datasets, title, ylabel="", money=False, figsize=(7,3)):
    fig, ax = plt.subplots(figsize=figsize)
    ax.set_facecolor("white")
    fig.patch.set_facecolor("white")
    x = np.arange(len(labels))
    n = len(datasets)
    w = 0.7 / n
    for i, (name, vals) in enumerate(datasets):
        bars = ax.bar(x + i*w - (n-1)*w/2, vals, w, label=name,
                      color=PALETTE[i % len(PALETTE)], alpha=0.88, zorder=3)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45, ha="right", fontsize=7)
    ax.yaxis.grid(True, linestyle="--", alpha=0.5, zorder=0)
    ax.set_axisbelow(True)
    ax.spines[["top","right","left"]].set_visible(False)
    ax.tick_params(axis="y", labelsize=7)
    if money:
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda v, _: f"${v:,.0f}"))
    ax.set_title(title, fontsize=10, fontweight="bold", color="#0F172A", pad=10)
    if n > 1:
        ax.legend(fontsize=7, framealpha=0.5)
    plt.tight_layout()
    return fig

def line_chart(labels, datasets, title, money=False, figsize=(7,3)):
    fig, ax = plt.subplots(figsize=figsize)
    ax.set_facecolor("white")
    fig.patch.set_facecolor("white")
    styles = ["-","--","-."]
    markers = ["o","s","^"]
    for i, (name, vals) in enumerate(datasets):
        ax.plot(labels, vals, linestyle=styles[i % 3], marker=markers[i % 3],
                markersize=4, linewidth=1.8, label=name, color=PALETTE[i % len(PALETTE)])
    ax.yaxis.grid(True, linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)
    ax.spines[["top","right","left"]].set_visible(False)
    ax.tick_params(axis="x", labelsize=7, rotation=45)
    ax.tick_params(axis="y", labelsize=7)
    if money:
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda v, _: f"${v:,.0f}"))
    ax.set_title(title, fontsize=10, fontweight="bold", color="#0F172A", pad=10)
    if len(datasets) > 1:
        ax.legend(fontsize=7, framealpha=0.5)
    plt.tight_layout()
    return fig

def pie_chart(labels, values, title, figsize=(5,5)):
    fig, ax = plt.subplots(figsize=figsize)
    fig.patch.set_facecolor("white")
    wedges, texts, autotexts = ax.pie(
        values, labels=None, autopct="%1.1f%%",
        colors=PALETTE[:len(values)], startangle=90,
        wedgeprops={"edgecolor":"white","linewidth":2},
        pctdistance=0.75,
    )
    for at in autotexts:
        at.set_fontsize(8)
        at.set_color("white")
        at.set_fontweight("bold")
    ax.legend(wedges, [f"{l} ({fmt(v)})" for l,v in zip(labels,values)],
              loc="lower center", bbox_to_anchor=(0.5,-0.1), ncol=2, fontsize=7, framealpha=0.4)
    ax.set_title(title, fontsize=10, fontweight="bold", color="#0F172A", pad=10)
    plt.tight_layout()
    return fig


def generate(stats_json: str) -> bytes:
    data = json.loads(stats_json)
    pacientes      = data.get("pacientes",     {})
    citas          = data.get("citas",         {})
    visitas        = data.get("visitas",       {})
    membresias     = data.get("membresias",    {})
    servicios      = data.get("servicios",     {})
    medicinas      = data.get("medicinas",     {})
    equipo         = data.get("equipo",        {})
    notificaciones = data.get("notificaciones",{})
    series         = data.get("series",        {})

    st = make_styles()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter,
                             leftMargin=0.75*inch, rightMargin=0.75*inch,
                             topMargin=0.75*inch, bottomMargin=0.75*inch)
    story = []

    def sp(n=8): return Spacer(1, n)

    # ── PORTADA ───────────────────────────────────────────────────────────────
    story.append(sp(20))
    story.append(Paragraph("Reporte Mensual", st["title"]))
    story.append(Paragraph("Estadísticas generales del sistema", st["subtitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_MID, spaceAfter=16))

    # ── 1. PACIENTES ──────────────────────────────────────────────────────────
    story.append(section_heading("1. Pacientes", st))
    story.append(sp(8))
    story.append(kpi_table([
        ("Total pacientes",      fmt(pacientes.get("total",0))),
        ("Pacientes vivos",      fmt(pacientes.get("vivos",0))),
        ("Pacientes fallecidos", fmt(pacientes.get("fallecidos",0))),
        ("Nuevos este mes",      fmt(pacientes.get("nuevos_mes",0))),
        ("Con válvula",          fmt(pacientes.get("con_valvula",0))),
        ("Con padecimientos",    fmt(pacientes.get("con_padecimientos",0))),
    ], st, accent=C_LBLUE, cols=3))
    story.append(sp(14))

    pac_serie = series.get("pacientesNuevosMes", [])
    if pac_serie:
        labels = [r.get("mes","") for r in pac_serie]
        vals   = [r.get("total",0) for r in pac_serie]
        fig = bar_chart(labels, [("Pacientes nuevos", vals)], "Pacientes nuevos por mes")
        story.append(chart_to_image(fig))
        story.append(sp(10))

    story.append(kpi_table([
        ("Membresías activas",   fmt(membresias.get("activas",0))),
        ("Membresías inactivas", fmt(membresias.get("inactivas",0))),
        ("Membresías vencidas",  fmt(membresias.get("vencidas",0))),
    ], st, accent=C_LGREEN, cols=3))
    story.append(sp(6))

    mb_vals = [membresias.get("activas",0), membresias.get("inactivas",0), membresias.get("vencidas",0)]
    if sum(mb_vals) > 0:
        fig = pie_chart(["Activas","Inactivas","Vencidas"], mb_vals, "Distribución de membresías")
        story.append(chart_to_image(fig, height=5))
    story.append(sp(16))

    # ── 2. CITAS ──────────────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(section_heading("2. Citas", st))
    story.append(sp(8))
    story.append(kpi_table([
        ("Total citas",   fmt(citas.get("total",0))),
        ("Atendidas",     fmt(citas.get("atendidas",0))),
        ("Canceladas",    fmt(citas.get("canceladas",0))),
        ("Pendientes",    fmt(citas.get("pendientes",0))),
    ], st, accent=C_LBLUE, cols=4))
    story.append(sp(14))

    def merge_by_mes(*lists_keys):
        merged = {}
        for lst, key in lists_keys:
            for r in lst:
                m = r.get("mes","")
                if m not in merged: merged[m] = {"mes": m}
                merged[m][key] = r.get("total",0)
        return [merged[k] for k in sorted(merged.keys())]

    citas_data = merge_by_mes(
        (series.get("citasMes",[]),          "total"),
        (series.get("citasAtendidasMes",[]), "atendidas"),
        (series.get("citasCanceladasMes",[]),"canceladas"),
    )
    if citas_data:
        labels = [r["mes"] for r in citas_data]
        fig = line_chart(labels, [
            ("Total",     [r.get("total",0)     for r in citas_data]),
            ("Atendidas", [r.get("atendidas",0) for r in citas_data]),
            ("Canceladas",[r.get("canceladas",0)for r in citas_data]),
        ], "Evolución de citas por mes")
        story.append(chart_to_image(fig))
        story.append(sp(10))

        trows = [[r["mes"], fmt(r.get("total",0)), fmt(r.get("atendidas",0)),
                  fmt(r.get("canceladas",0)),
                  f"{(r.get('atendidas',0)/r['total']*100):.1f}%" if r.get("total",0) else "—"
                 ] for r in citas_data]
        story.append(data_table(
            ["Mes","Total","Atendidas","Canceladas","Tasa Atención"],
            trows,
            col_widths=[1.3*inch,1.1*inch,1.1*inch,1.1*inch,1.1*inch]
        ))
    story.append(sp(16))

    # ── 3. VISITAS E INGRESOS ────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(section_heading("3. Visitas e Ingresos", st))
    story.append(sp(8))
    story.append(kpi_table([
        ("Total visitas",       fmt(visitas.get("total",0))),
        ("Visitas este mes",    fmt(visitas.get("mes",0))),
        ("Ingresos totales",    fmt_money(visitas.get("ingresos_totales",0))),
        ("Descuentos totales",  fmt_money(visitas.get("descuentos_totales",0))),
        ("Ingreso promedio",    fmt_money(visitas.get("ingreso_promedio",0))),
        ("% pago completo",     f"{visitas.get('porcentaje_pago',0)}%"),
    ], st, accent=C_LGREEN, cols=3))
    story.append(sp(14))

    ing_data = merge_by_mes(
        (series.get("ingresosMes",[]),   "ingresos"),
        (series.get("descuentosMes",[]), "descuentos"),
    )
    if ing_data:
        labels = [r["mes"] for r in ing_data]
        fig = bar_chart(labels, [
            ("Ingresos",   [r.get("ingresos",0)   for r in ing_data]),
            ("Descuentos", [r.get("descuentos",0) for r in ing_data]),
        ], "Ingresos vs Descuentos por mes", money=True)
        story.append(chart_to_image(fig))
        story.append(sp(10))

        trows_i = [[r["mes"],
                    fmt_money(r.get("ingresos",0)),
                    fmt_money(r.get("descuentos",0)),
                    fmt_money(r.get("ingresos",0)-r.get("descuentos",0))]
                   for r in ing_data]
        story.append(data_table(
            ["Mes","Ingresos","Descuentos","Neto"],
            trows_i,
            col_widths=[1.5*inch,1.7*inch,1.7*inch,1.6*inch]
        ))
    story.append(sp(14))

    srv_data = merge_by_mes(
        (series.get("visitasMes",[]),              "visitas"),
        (series.get("serviciosMes",[]),            "servicios"),
        (series.get("medicinasUtilizadasMes",[]),  "medicinas"),
    )
    if srv_data:
        labels = [r["mes"] for r in srv_data]
        fig = line_chart(labels, [
            ("Visitas",   [r.get("visitas",0)   for r in srv_data]),
            ("Servicios", [r.get("servicios",0) for r in srv_data]),
            ("Medicinas", [r.get("medicinas",0) for r in srv_data]),
        ], "Servicios y visitas por mes")
        story.append(chart_to_image(fig))
        story.append(sp(10))

        trows_s = [[r["mes"], fmt(r.get("visitas",0)), fmt(r.get("servicios",0)), fmt(r.get("medicinas",0))]
                   for r in srv_data]
        story.append(data_table(
            ["Mes","Visitas","Servicios","Medicinas"],
            trows_s,
            col_widths=[1.5*inch, 1.7*inch, 1.65*inch, 1.65*inch]
        ))

    # ── 4. INVENTARIO ─────────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(section_heading("4. Inventario", st))
    story.append(sp(8))
    story.append(Paragraph("<b>Medicinas</b>", ParagraphStyle("h3", fontName="Helvetica-Bold",
                fontSize=10, textColor=C_MID, spaceAfter=6)))
    story.append(kpi_table([
        ("Total medicinas",      fmt(medicinas.get("total",0))),
        ("Stock total",          fmt(medicinas.get("stock_total",0))),
        ("Bajo stock",           fmt(medicinas.get("bajo_stock",0))),
        ("Valor inventario",     fmt_money(medicinas.get("valor_inventario",0))),
        ("Medicinas utilizadas", fmt(medicinas.get("utilizadas",0))),
        ("Actualizaciones",      fmt(medicinas.get("actualizaciones_inventario",0))),
    ], st, accent=C_LBLUE, cols=3))
    story.append(sp(12))

    med_mes_data = series.get("medicinasUtilizadasMes", [])
    if med_mes_data:
        labels = [r.get("mes","") for r in med_mes_data]
        vals   = [r.get("total",0) for r in med_mes_data]
        fig = bar_chart(labels, [("Medicinas utilizadas", vals)], "Medicinas utilizadas por mes")
        story.append(chart_to_image(fig, height=2.8))
        story.append(sp(10))

    story.append(Paragraph("<b>Equipo médico</b>", ParagraphStyle("h3", fontName="Helvetica-Bold",
                fontSize=10, textColor=C_MID, spaceAfter=6)))
    story.append(kpi_table([
        ("Total equipos",      fmt(equipo.get("total",0))),
        ("Cantidad disponible",fmt(equipo.get("cantidad_total",0))),
        ("En uso",             fmt(equipo.get("en_uso",0))),
        ("Regresados",         fmt(equipo.get("regresados",0))),
        ("% retorno",          f"{equipo.get('porcentaje_retorno',0)}%"),
        ("Valor total",        fmt_money(equipo.get("valor_total",0))),
    ], st, accent=C_LAMBER, cols=3))
    story.append(sp(12))

    eq_vals = [equipo.get("en_uso",0), equipo.get("regresados",0)]
    if sum(eq_vals) > 0:
        fig = pie_chart(["En uso","Regresados"], eq_vals, "Estado del equipo médico", figsize=(5,5))
        story.append(chart_to_image(fig, height=5))

    # ── 5. NOTIFICACIONES ─────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(section_heading("5. Notificaciones", st))
    story.append(sp(8))
    story.append(kpi_table([
        ("Este mes",         fmt(notificaciones.get("mes",0))),
        ("Rechazados",       fmt(notificaciones.get("rechazados",0))),
        ("Tasa aprobación",  f"{notificaciones.get('tasa_aprobacion',0)}%"),
    ], st, accent=C_LRED, cols=3))
    story.append(sp(14))

    notif_serie = series.get("notificacionesMes", [])
    if notif_serie:
        labels = [r.get("mes","") for r in notif_serie]
        vals   = [r.get("total",0) for r in notif_serie]
        fig = bar_chart(labels, [("Notificaciones", vals)], "Notificaciones por mes")
        story.append(chart_to_image(fig, height=2.8))
        story.append(sp(10))

        trows_n = [[r.get("mes",""), fmt(r.get("total",0))] for r in notif_serie]
        story.append(data_table(
            ["Mes","Total Notificaciones"],
            trows_n,
            col_widths=[2.5*inch, 4*inch]
        ))

    doc.build(story)
    return buf.getvalue()


if __name__ == "__main__":
    raw = sys.stdin.read()
    result = generate(raw)
    sys.stdout.buffer.write(base64.b64encode(result))