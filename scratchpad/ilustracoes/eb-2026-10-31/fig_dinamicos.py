from lib import *

OUT = '/home/user/endodirect/figuras/resumos/ilustracoes/endocrinologia-basica--testes-dinamicos.svg'

def seg_path(x0, x1, y, h, r, left=False, right=False):
    """retângulo com cantos arredondados só de um lado"""
    d = f'M{f(x0 + (r if left else 0))},{f(y)} '
    if right:
        d += f'L{f(x1 - r)},{f(y)} A{r},{r} 0 0 1 {f(x1)},{f(y + r)} L{f(x1)},{f(y + h - r)} A{r},{r} 0 0 1 {f(x1 - r)},{f(y + h)} '
    else:
        d += f'L{f(x1)},{f(y)} L{f(x1)},{f(y + h)} '
    if left:
        d += f'L{f(x0 + r)},{f(y + h)} A{r},{r} 0 0 1 {f(x0)},{f(y + h - r)} L{f(x0)},{f(y + r)} A{r},{r} 0 0 1 {f(x0 + r)},{f(y)} Z'
    else:
        d += f'L{f(x0)},{f(y + h)} Z'
    return d

def card(x, y, w, h, color, bold_line, lines):
    o = [rect(x, y, w, h, 8, '#ffffff', LINE, 1.2), rect(x, y, 3.5, h, 1.5, color)]
    o.append(T(x + 13, y + 18, bold_line, 11.5, INK, 'start', bold=True))
    for i, ln in enumerate(lines):
        o.append(T(x + 13, y + 34 + 14.5 * i, ln, 11, INK, 'start'))
    return o

def chart(px, py, kind):
    """kind = 'sup' (supressão) ou 'est' (estímulo)"""
    o = []
    ax = px + 44; top = py + 58; base = py + 166; right = px + 238
    o.append(P(f'M{f(ax)},{f(base)} L{f(ax)},{f(top)}', '#94a3b8', 1.4, marker='a-s'))
    o.append(P(f'M{f(ax)},{f(base)} L{f(right)},{f(base)}', '#94a3b8', 1.4, marker='a-s'))
    o.append(T(ax - 12, (top + base) / 2 + 4, 'nível do hormônio', 11, MUTED, italic=True,
               extra=f'transform="rotate(-90 {f(ax - 12)} {f((top + base) / 2)})"'))
    x1 = px + 122; x2 = px + 214
    o.append(T(x1, base + 16, 'basal', 11, MUTED))
    o.append(T(x2, base + 16, 'após supressão' if kind == 'sup' else 'após estímulo', 11, MUTED))
    if kind == 'sup':
        cut = py + 132
        lines = [((x1, py + 76), (x2, py + 80), RED, 'a-r', ['autônomo:', 'não suprime'], RED_D),
                 ((x1, py + 84), (x2, py + 152), GREEN, 'a-g', ['normal:', 'suprime'], GREEN_D)]
        lab_y = cut - 6
    else:
        cut = py + 92
        lines = [((x1, py + 148), (x2, py + 72), GREEN, 'a-g', ['normal:', 'responde'], GREEN_D),
                 ((x1, py + 156), (x2, py + 152), RED, 'a-r', ['falência:', 'não responde'], RED_D)]
        lab_y = cut - 6
    o.append(L(ax, cut, x2 + 14, cut, MUTED, 1.3, '5 4'))
    o.append(T(ax + 6, lab_y, 'ponto de corte', 11, MUTED, 'start', italic=True))
    for (a, b, col, mk, words, dark) in lines:
        o.append(P(f'M{f(a[0])},{f(a[1])} L{f(b[0])},{f(b[1])}', col, 2.2))
        o.append(circ(a[0], a[1], 4, col))
        o.append(circ(b[0], b[1], 4.5, col, '#ffffff', 1.2))
        yy = b[1] - 3
        o.append(T(x2 + 34, yy, words[0], 11.5, dark, 'start', bold=True))
        o.append(T(x2 + 34, yy + 14, words[1], 11.5, dark, 'start', bold=True))
    return o

def build():
    H = 500
    o = header(H, 'Testes basais e dinâmicos: suprimir o excesso, estimular a deficiência',
               ['A dosagem basal serve quando o hormônio é estável; na zona cinzenta, o teste dinâmico decide.'])
    # faixa do cortisol basal
    y = 80; h = 30; x0 = 168; xa = 370; xb = 600; x1 = 790
    o.append(T(36, y + 13, 'Cortisol basal', 12.5, INK, 'start', bold=True))
    o.append(T(36, y + 28, 'às 8 h', 11, MUTED, 'start'))
    o.append(P(seg_path(x0, xa, y, h, 8, left=True), RED, 1.4, F_RED, cap=None))
    o.append(P(seg_path(xa, xb, y, h, 8), '#94a3b8', 1.4, F_GREY, cap=None))
    o.append(P(seg_path(xb, x1, y, h, 8, right=True), GREEN, 1.4, F_GREEN, cap=None))
    o.append(T((x0 + xa) / 2, y + 19, 'sugere insuficiência adrenal', 11.5, RED_D, bold=True))
    o.append(T((xa + xb) / 2, y + 19, 'zona cinzenta: teste dinâmico', 11.5, INK, bold=True))
    o.append(T((xb + x1) / 2, y + 19, 'praticamente a exclui', 11.5, GREEN_D, bold=True))
    for xx, s in ((xa, '3 µg/dL'), (xb, '15–18 µg/dL')):
        o.append(L(xx, y + h, xx, y + h + 6, INK, 1.2))
        o.append(T(xx, y + h + 19, s, 11, INK, bold=True))
    # painéis
    PY = 150; PH = 330; PW = 374
    for px, kind in ((28, 'sup'), (418, 'est')):
        cx = px + PW / 2
        o.append(panel(px, PY, PW, PH))
        if kind == 'sup':
            o.append(T(cx, PY + 24, 'Confirmar excesso → supressão', 14, RED, bold=True))
            o.append(T(cx, PY + 42, 'se não suprime, é autônomo', 11.5, MUTED))
        else:
            o.append(T(cx, PY + 24, 'Confirmar deficiência → estímulo', 14, BLUE, bold=True))
            o.append(T(cx, PY + 42, 'se não responde, há falência', 11.5, MUTED))
        o += chart(px, PY, kind)
        cy0 = PY + 200; ch = 58; cw = PW - 28
        if kind == 'sup':
            o += card(px + 14, cy0, cw, ch, RED, 'Dexametasona 1 mg às 23 h',
                      ['cortisol das 8 h > 1,8 µg/dL (50 nmol/L):', 'positivo para Cushing'])
            o += card(px + 14, cy0 + ch + 8, cw, ch, RED, 'TOTG com GH (75 g)',
                      ['nadir de GH > 0,4 ng/mL (ensaios ultrassensíveis):', 'não suprime → acromegalia'])
        else:
            o += card(px + 14, cy0, cw, ch, BLUE, 'Cortrosina (ACTH sintético 250 µg IV/IM)',
                      ['cortisol aos 30–60 min > 18–20 µg/dL:', 'exclui insuficiência adrenal'])
            o += card(px + 14, cy0 + ch + 8, cw, ch, BLUE, 'ITT: padrão-ouro para os eixos GH e ACTH',
                      ['exige glicemia < 40 mg/dL; resposta normal:', 'GH > 3–5 ng/mL e cortisol > 18–20 µg/dL'])
    return o

if __name__ == '__main__':
    write(OUT, build())
    print('ok', OUT)
