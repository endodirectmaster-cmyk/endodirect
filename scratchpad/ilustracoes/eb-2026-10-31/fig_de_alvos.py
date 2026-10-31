from lib import *

OUT = '/home/user/endodirect/figuras/resumos/ilustracoes/endocrinologia-basica--disruptores-alvos.svg'

def card(x, y, w, h, title, color):
    return [rect(x, y, w, h, 10, '#ffffff', LINE, 1.2),
            T(x + w / 2, y + 20, title, 12.5, color, bold=True)] + de_glyph(x + w - 18, y + 18, 11.5)

def capsule(cx, cy, ang, fill, stroke):
    return (f'<rect x="{f(cx - 8)}" y="{f(cy - 3.5)}" width="16" height="7" rx="3.5" fill="{fill}" stroke="{stroke}" '
            f'stroke-width="1.2" transform="rotate({ang} {f(cx)} {f(cy)})"/>')

def ligand_block(x0, y, label, dot_fill, dot_stroke, cupx):
    o = [T(x0 + 10, y - 12, label, 11, INK, italic=True, bold=True)]
    for dx, dy in ((0, 0), (10, -5), (20, 0)):
        o.append(circ(x0 + dx, y + dy, 4.2, dot_fill, dot_stroke, 1.2))
    o.append(P(f'M{f(x0 + 28)},{f(y)} L{f(cupx - 26)},{f(y)}', MUTED, 2, marker='i-r'))
    o.append(cup(cupx, y - 8, 36, 22, 7, r=5, sw=1.6))
    return o

def build():
    H = 592
    o = header(H, 'Onde os disruptores atuam: eixo metabólico e eixos hipotálamo-hipófise',
               ['Três alvos metabólicos e efeitos sobre a tireoide, a adrenal e as gônadas.'])
    # ===== eixo metabólico =====
    o.append(panel(28, 72, 764, 204))
    o.append(T(410, 96, 'Eixo metabólico', 15, GREEN, bold=True))
    o.append(T(410, 113, 'bisfenóis e ftalatos na obesidade (revisão de Dalamaga e colaboradores, 2024): três alvos', 11, MUTED))
    cy = 124; ch = 140; cw = 240
    X = [40, 290, 540]
    # 1. metabolismo energético
    x = X[0]
    o += card(x, cy, cw, ch, 'Metabolismo energético', GREEN_D)
    a, b = (x + 56, cy + 58), (x + 178, cy + 58)
    o.append(circ(*a, 14, F_GREY, MUTED, 1.6))
    o.append(circ(a[0] - 5, a[1] + 3, 4, F_NUC, '#7c86c9', 1.1))
    for dx, dy in ((5, -5), (7, 5), (-2, -8)):
        o.append(circ(a[0] + dx, a[1] + dy, 2.6, F_AMBER, AMBER, 1))
    o.append(circ(*b, 24, F_GREY, MUTED, 1.6))
    o.append(circ(b[0] + 3, b[1] - 1, 17, F_AMBER, AMBER, 1.4))
    o.append(ell(b[0] - 16, b[1] + 11, 4.5, 3.2, F_NUC, '#7c86c9', 1.1))
    o.append(P(f'M{f(a[0] + 20)},{f(a[1])} L{f(b[0] - 30)},{f(b[1])}', MUTED, 2, marker='a-s'))
    o.append(T((a[0] + b[0]) / 2 - 3, a[1] + 17, 'diferenciação', 11, MUTED, italic=True))
    o.append(T(a[0], cy + 94, 'pré-adipócito', 11, INK))
    o.append(T(b[0], cy + 94, 'adipócito maduro', 11, INK))
    o.append(T(x + cw / 2, cy + 114, 'expressão de genes da adipogênese', 11, GREEN_D, bold=False))
    o.append(T(x + cw / 2, cy + 128, '(PPARγ) e diferenciação alteradas', 11, GREEN_D, bold=False))
    # 2. saciedade e fome
    x = X[1]
    o += card(x, cy, cw, ch, 'Saciedade e fome', GREEN_D)
    o += ligand_block(x + 22, cy + 62, 'leptina', F_RED, RED, x + 96)
    o.append(T(x + 62, cy + 104, 'resistência', 11, GREEN_D, bold=True))
    o.append(T(x + 62, cy + 118, 'à leptina', 11, GREEN_D, bold=True))
    mx, my = x + 178, cy + 60
    o.append(ell(mx, my, 44, 24, '#f4f7fb', '#94a3b8', 1.2, '4 3'))
    for (dx, dy, ang, fl, st) in ((-24, -6, 30, F_GREEN, GREEN), (-4, -11, -20, F_TEAL, TEAL), (16, -6, 50, F_PURPLE, PURPLE),
                                  (-14, 8, -40, F_AMBER, AMBER), (8, 9, 15, F_GREEN, GREEN), (28, 6, -30, F_RED, RED)):
        o.append(capsule(mx + dx, my + dy, ang, fl, st))
    o.append(T(mx, cy + 104, 'alteração da', 11, GREEN_D, bold=True))
    o.append(T(mx, cy + 118, 'microbiota intestinal', 11, GREEN_D, bold=True))
    # 3. sinalização de insulina
    x = X[2]
    o += card(x, cy, cw, ch, 'Sinalização de insulina', GREEN_D)
    o += ligand_block(x + 72, cy + 62, 'insulina', F_BLUE, BLUE, x + 152)
    o.append(T(x + cw / 2, cy + 104, 'resistência insulínica', 11, GREEN_D, bold=True))

    # ===== eixos hipotálamo-hipófise =====
    py = 288
    o.append(panel(28, py, 764, 232))
    o.append(T(44, py + 24, 'Eixos hipotálamo-hipófise', 15, PURPLE, 'start', bold=True))
    o.append(T(44, py + 41, 'tireoide, adrenal e gônadas', 11, MUTED, 'start'))
    o.append(ell(410, py + 26, 54, 15, F_GREY, MUTED, 1.6))
    o.append(T(410, py + 30, 'hipotálamo', 11.5, INK, bold=True))
    o.append(P(f'M410,{py + 42} L410,{py + 58}', NAVY, 2, marker='a-n'))
    o.append(ell(410, py + 74, 48, 15, F_GREY, MUTED, 1.6))
    o.append(T(410, py + 78, 'hipófise', 11.5, INK, bold=True))
    ky = py + 116; kh = 104
    # setas da hipófise para as glândulas
    o.append(P(f'M368,{py + 82} C300,{py + 98} 176,{py + 92} 160,{ky - 4}', PURPLE, 2, marker='a-p'))
    o.append(T(262, py + 108, 'TSH ↑', 11.5, PURPLE_D, bold=True))
    o.append(P(f'M410,{py + 90} L410,{ky - 4}', PURPLE, 2, marker='a-p'))
    o.append(P(f'M452,{py + 82} C520,{py + 98} 644,{py + 92} 660,{ky - 4}', PURPLE, 2, marker='a-p'))
    o.append(T(560, py + 108, 'LH', 11.5, PURPLE_D, bold=True))
    # tireoide
    x = X[0]
    o += card(x, ky, cw, kh, 'Tireoide', PURPLE_D)
    tx, tyy = x + 36, ky + 62
    o.append(rect(tx - 9, tyy + 3, 18, 8, 3, F_PURPLE, PURPLE, 1.4))
    o.append(f'<ellipse cx="{f(tx - 9)}" cy="{f(tyy)}" rx="8" ry="16" fill="{F_PURPLE}" stroke="{PURPLE}" stroke-width="1.6" transform="rotate(-12 {f(tx - 9)} {f(tyy)})"/>')
    o.append(f'<ellipse cx="{f(tx + 9)}" cy="{f(tyy)}" rx="8" ry="16" fill="{F_PURPLE}" stroke="{PURPLE}" stroke-width="1.6" transform="rotate(12 {f(tx + 9)} {f(tyy)})"/>')
    o.append(T(x + 66, ky + 56, 'alteração na TPO e no NIS,', 11, INK, 'start'))
    o.append(T(x + 66, ky + 71, 'com aumento do TSH', 11, INK, 'start', bold=True))
    # adrenal
    x = X[1]
    o += card(x, ky, cw, kh, 'Adrenal', PURPLE_D)
    ax_, ay_ = x + 36, ky + 66
    o.append(ell(ax_, ay_, 12, 17, F_RED, RED, 1.6))
    o.append(P(f'M{f(ax_ - 13)},{f(ay_ - 12)} Q{f(ax_)},{f(ay_ - 36)} {f(ax_ + 13)},{f(ay_ - 12)} Q{f(ax_)},{f(ay_ - 18)} {f(ax_ - 13)},{f(ay_ - 12)} Z',
               AMBER, 1.6, F_AMBER, cap=None))
    o.append(T(x + 66, ky + 56, 'alteração do ciclo', 11, INK, 'start'))
    o.append(T(x + 66, ky + 71, 'circadiano do cortisol', 11, INK, 'start', bold=True))
    # gônadas
    x = X[2]
    o += card(x, ky, cw, kh, 'Gônadas', PURPLE_D)
    gx, gy = x + 30, ky + 62
    o.append(ell(gx, gy, 16, 11, F_AMBER, AMBER, 1.6))
    for dx, dy in ((-7, -2), (2, 4), (8, -4)):
        o.append(circ(gx + dx, gy + dy, 3.2, '#ffffff', AMBER, 1.2))
    lines = [[('ligação ao receptor estrogênico:', None)], [('puberdade precoce em meninas', {'bold': True})],
             [('↓ ação dos contraceptivos orais', None)], [('secreção de LH alterada: ', None), ('SOMP', {'bold': True})]]
    for i, parts in enumerate(lines):
        o.append(TR(x + 58, ky + 40 + 15 * i, parts, 11, INK, 'start'))
    nb, nh = note(28, 532, 764, [
        [('Pegadinha: ', {'bold': True}), ('a associação com ', None), ('diabetes mellitus e obesidade existe', {'bold': True}),
         (' — a alternativa que a nega é a incorreta.', None)]])
    o += nb
    return o

if __name__ == '__main__':
    write(OUT, build())
    print('ok', OUT)
