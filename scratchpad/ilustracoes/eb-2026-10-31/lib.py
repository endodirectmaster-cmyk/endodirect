# Helpers para desenhar as ilustrações no estilo das já publicadas
# (moldura, paleta, fontes e marcadores copiados de
#  endocrinologia-basica--receptores-nucleares.svg).
import math, os
from PIL import ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
DEFS = open(os.path.join(HERE, 'defs.txt')).read()
FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

# paleta
NAVY = '#0b2545'; BLUE = '#2563eb'; GREEN = '#2e7d32'; RED = '#c0392b'
PURPLE = '#6d28d9'; TEAL = '#0f766e'; AMBER = '#b7791f'
INK = '#1f2f45'; MUTED = '#5b6f88'; SUB = '#64748b'; TITLE = '#0f172a'
# tons escuros para texto sobre fundo claro
RED_D = '#8b1e14'; GREEN_D = '#1b5e20'; PURPLE_D = '#4c1d95'; TEAL_D = '#134e4a'
AMBER_D = '#7c4a03'; BLUE_D = '#1e40af'
# fundos
F_AMBER = '#fff4d6'; F_PURPLE = '#efe9fe'; F_BLUE = '#e8f0fe'; F_NUC = '#eef0fb'
F_RED = '#fdecec'; F_GREEN = '#e6f4ea'; F_TEAL = '#e0f2f1'; F_GREY = '#eef2f7'
PANEL = '#f8fafc'; LINE = '#e2e8f0'

_FONTS = {}
def _font(bold, italic):
    key = (bold, italic)
    if key not in _FONTS:
        base = '/usr/share/fonts/truetype/liberation/LiberationSans-'
        name = {(False, False): 'Regular', (True, False): 'Bold',
                (False, True): 'Italic', (True, True): 'BoldItalic'}[key]
        _FONTS[key] = ImageFont.truetype(base + name + '.ttf', 100)
    return _FONTS[key]

def tw(s, size=11, bold=False, italic=False):
    """largura aproximada (Liberation Sans ~ Arial/Helvetica)"""
    return _font(bold, italic).getlength(s) * size / 100.0

def f(v):
    if isinstance(v, str):
        return v
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    return '0' if s == '-0' else s

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def T(x, y, s, size=11, fill=INK, anchor='middle', bold=False, italic=False, extra=''):
    a = f'x="{f(x)}" y="{f(y)}" font-family="{FONT}" font-size="{f(size)}"'
    if bold: a += ' font-weight="700"'
    if italic: a += ' font-style="italic"'
    a += f' fill="{fill}" text-anchor="{anchor}"'
    if extra: a += ' ' + extra
    return f'<text {a}>{esc(s)}</text>'

def TR(x, y, parts, size=11, fill=INK, anchor='middle', bold=False, italic=False):
    """texto com trechos em negrito/cor: parts = [(texto, {'bold':..,'fill':..,'italic':..})]"""
    a = f'x="{f(x)}" y="{f(y)}" font-family="{FONT}" font-size="{f(size)}"'
    if bold: a += ' font-weight="700"'
    if italic: a += ' font-style="italic"'
    a += f' fill="{fill}" text-anchor="{anchor}"'
    inner = ''
    for txt, st in parts:
        if not st:
            inner += esc(txt); continue
        ta = ''
        if st.get('bold'): ta += ' font-weight="700"'
        if st.get('italic'): ta += ' font-style="italic"'
        if st.get('fill'): ta += f' fill="{st["fill"]}"'
        inner += f'<tspan{ta}>{esc(txt)}</tspan>'
    return f'<text {a}>{inner}</text>'

def trw(parts, size=11, bold=False):
    return sum(tw(t, size, st.get('bold', bold) if st else bold, (st or {}).get('italic', False)) for t, st in parts)

def rect(x, y, w, h, rx=0, fill='none', stroke=None, sw=None, dash=None, extra=''):
    a = f'x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"'
    if rx: a += f' rx="{f(rx)}"'
    a += f' fill="{fill}"'
    if stroke: a += f' stroke="{stroke}"'
    if sw: a += f' stroke-width="{f(sw)}"'
    if dash: a += f' stroke-dasharray="{dash}"'
    if extra: a += ' ' + extra
    return f'<rect {a}/>'

def ell(cx, cy, rx, ry, fill='none', stroke=None, sw=None, dash=None):
    a = f'cx="{f(cx)}" cy="{f(cy)}" rx="{f(rx)}" ry="{f(ry)}" fill="{fill}"'
    if stroke: a += f' stroke="{stroke}"'
    if sw: a += f' stroke-width="{f(sw)}"'
    if dash: a += f' stroke-dasharray="{dash}"'
    return f'<ellipse {a}/>'

def circ(cx, cy, r, fill='none', stroke=None, sw=None, dash=None):
    a = f'cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="{fill}"'
    if stroke: a += f' stroke="{stroke}"'
    if sw: a += f' stroke-width="{f(sw)}"'
    if dash: a += f' stroke-dasharray="{dash}"'
    return f'<circle {a}/>'

def P(d, stroke=MUTED, sw=2, fill='none', dash=None, marker=None, cap='round', extra=''):
    a = f'd="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{f(sw)}"'
    if dash: a += f' stroke-dasharray="{dash}"'
    if cap: a += f' stroke-linecap="{cap}"'
    if marker: a += f' marker-end="url(#{marker})"'
    if extra: a += ' ' + extra
    return f'<path {a}/>'

def L(x1, y1, x2, y2, stroke=MUTED, sw=1.2, dash=None):
    a = f'x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" stroke="{stroke}" stroke-width="{f(sw)}"'
    if dash: a += f' stroke-dasharray="{dash}"'
    return f'<line {a}/>'

def poly(pts, fill='none', stroke=None, sw=None):
    s = ' '.join(f'{f(x)},{f(y)}' for x, y in pts)
    a = f'points="{s}" fill="{fill}"'
    if stroke: a += f' stroke="{stroke}"'
    if sw: a += f' stroke-width="{f(sw)}"'
    return f'<polygon {a}/>'

def hexagon(cx, cy, r, pointy=True):
    pts = []
    for k in range(6):
        ang = math.radians(60 * k + (30 if pointy else 0))
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return pts

def header(h, title, subtitle_lines, label=None):
    label = label or title
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 {h}" width="820" height="{h}" role="img" aria-label="{esc(label)}">',
           f'<title>{esc(label)}</title>', DEFS,
           rect(1, 1, 818, h - 2, 16, '#ffffff', LINE),
           T(410, 32, title, 18, TITLE, bold=True)]
    for i, s in enumerate(subtitle_lines):
        out.append(T(410, 51 + 16 * i, s, 12.5, SUB))
    return out

def note(x, y, w, lines, kind='blue'):
    bg, bar = (F_BLUE, BLUE) if kind == 'blue' else ('#f6f2e6', '#d9b652')
    h = 14.6 * len(lines) + 14.7
    out = [rect(x, y, w, h, 6, bg), rect(x, y, 3.5, h, 1.5, bar)]
    for i, ln in enumerate(lines):
        if isinstance(ln, list):
            out.append(TR(x + 11, y + 16.2 + 14.6 * i, ln, 11.2, INK, 'start'))
        else:
            out.append(T(x + 11, y + 16.2 + 14.6 * i, ln, 11.2, INK, 'start'))
    return out, h

def panel(x, y, w, h):
    return rect(x, y, w, h, 14, PANEL, LINE)

# ---------- glifos ----------
_STER = [
    [(61.2, 135), (56, 138), (50.8, 135), (50.8, 129), (56, 126), (61.2, 129)],
    [(71.6, 135), (66.4, 138), (61.2, 135), (61.2, 129), (66.4, 126), (71.6, 129)],
    [(76.8, 126), (71.6, 129), (66.4, 126), (66.4, 120), (71.6, 117), (76.8, 120)],
    [(75.8, 121.5), (79.7, 116.1), (86.1, 118.1), (86.1, 124.9), (79.7, 126.9)],
]
def steroid(cx, cy, s=1.0, fill=F_AMBER, stroke=AMBER, sw=1.6):
    ox, oy = 68.45, 127.05
    return [poly([((x - ox) * s + cx, (y - oy) * s + cy) for x, y in pg], fill, stroke, sw) for pg in _STER]

def bpa(cx, cy, s=1.0):
    r = 6 * s
    out = [poly(hexagon(cx - 9 * s, cy, r), F_TEAL, TEAL, 1.8),
           L(cx - 9 * s + r * 0.87, cy, cx + 9 * s - r * 0.87, cy, TEAL, 1.8),
           poly(hexagon(cx + 9 * s, cy, r), F_TEAL, TEAL, 1.8)]
    return out

def ftalato(cx, cy, s=1.0):
    r = 7 * s
    hx = hexagon(cx - 4 * s, cy, r)
    out = [poly(hx, F_TEAL, TEAL, 1.8)]
    # dois braços éster em vértices adjacentes (direita-cima e direita-baixo)
    for (vx, vy), dy in ((hx[5], -1), (hx[0], 1)):
        ex, ey = vx + 7 * s, vy + dy * 4 * s
        out.append(L(vx, vy, ex, ey, TEAL, 1.8))
        out.append(circ(ex + 2.2 * s, ey + dy * 1.2 * s, 2.4 * s, F_TEAL, TEAL, 1.4))
    return out

def de_glyph(cx, cy, r=13):
    return [poly(hexagon(cx, cy, r), F_TEAL, TEAL, 1.8), T(cx, cy + 4, 'DE', 11, TEAL_D, bold=True)]

def cup(cx, top, w=78, h=40, notch=13, fill=F_PURPLE, stroke=PURPLE, sw=1.8, r=8):
    l, rr, b = cx - w / 2, cx + w / 2, top + h
    d = (f'M{f(l + r)},{f(top)} L{f(cx - notch)},{f(top)} A{f(notch)},{f(notch)} 0 0 0 {f(cx + notch)},{f(top)} '
         f'L{f(rr - r)},{f(top)} Q{f(rr)},{f(top)} {f(rr)},{f(top + r)} L{f(rr)},{f(b - r)} Q{f(rr)},{f(b)} {f(rr - r)},{f(b)} '
         f'L{f(l + r)},{f(b)} Q{f(l)},{f(b)} {f(l)},{f(b - r)} L{f(l)},{f(top + r)} Q{f(l)},{f(top)} {f(l + r)},{f(top)} Z')
    return P(d, stroke, sw, fill, cap=None)

def pill(cx, cy, text, size=11, fill=F_PURPLE, stroke=PURPLE, color=PURPLE_D, bold=False, padx=9, h=None, italic=False):
    w = tw(text, size, bold, italic) + 2 * padx
    h = h or size + 9
    return [rect(cx - w / 2, cy - h / 2, w, h, h / 2, fill, stroke, 1.2),
            T(cx, cy + size * 0.36, text, size, color, bold=bold, italic=italic)], w

def write(path, parts):
    s = ''.join(parts) + '</svg>'
    open(path, 'w').write(s)
    return s
