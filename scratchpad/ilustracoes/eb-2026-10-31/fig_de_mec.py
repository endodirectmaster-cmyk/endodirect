from lib import *

OUT = '/home/user/endodirect/figuras/resumos/ilustracoes/endocrinologia-basica--disruptores-mecanismos.svg'

def wave(x0, x1, y, amp=5, per=18):
    pts = []
    n = int((x1 - x0) / 2)
    for k in range(n + 1):
        x = x0 + (x1 - x0) * k / n
        pts.append(f'{f(x)},{f(y + amp * math.sin(2 * math.pi * (x - x0) / per))}')
    return 'M' + ' L'.join(pts)

def dna(x0, x1, y, amp=6, per=30):
    o = []
    k = 0
    x = x0 + 4
    while x < x1 - 2:
        d = amp * abs(math.sin(2 * math.pi * (x - x0) / per)) * 0.75
        if d > 1.5:
            o.append(L(x, y - d, x, y + d, '#b9c2d6', 1.4))
        x += 7.5
    o.append(P(wave(x0, x1, y, amp, per), NAVY, 2, cap=None))
    o.append(P(wave(x0, x1, y, -amp, per), MUTED, 2, cap=None))
    return o

def build():
    H = 600
    o = header(H, 'Disruptores endócrinos: como interferem na ação hormonal',
               ['Mimetizam, bloqueiam ou alteram o metabolismo dos hormônios naturais, e agem além da ocupação do receptor.'])
    PW = 374; PH = 172
    A = (28, 72); B = (418, 72); C = (28, 254); D = (418, 254)
    for px, py in (A, B, C, D):
        o.append(panel(px, py, PW, PH))

    # ---- A: agonista ----
    px, py = A; cx = px + PW / 2
    o.append(T(cx, py + 24, 'Mimetizam — agonista', 14, GREEN, bold=True))
    o.append(T(cx, py + 42, 'o bisfenol A é agonista do receptor estrogênico', 11, MUTED))
    for gx, lig in ((px + 84, 'estrogênio'), (px + 250, 'bisfenol A')):
        top = py + 104
        o.append(cup(gx, top, 80, 38))
        if lig == 'estrogênio':
            o += steroid(gx + 3, top - 4, 1.05)
            o.append(T(gx, py + 72, 'estrogênio', 11, AMBER_D, italic=True, bold=True))
        else:
            o += bpa(gx, top - 3, 1.15)
            o.append(T(gx, py + 72, 'bisfenol A', 11, TEAL_D, italic=True, bold=True))
        o.append(T(gx, top + 54, 'receptor estrogênico', 11, PURPLE_D))
        o.append(P(f'M{f(gx + 44)},{f(top + 20)} L{f(gx + 70)},{f(top + 20)}', GREEN, 2.2, marker='a-g'))
        o.append(T(gx + 76, top + 24, 'ativa', 11.5, GREEN_D, 'start', bold=True))

    # ---- B: antagonista ----
    px, py = B; cx = px + PW / 2
    o.append(T(cx, py + 24, 'Bloqueiam — antagonista', 14, RED, bold=True))
    o.append(T(cx, py + 42, 'os ftalatos são antagonistas do receptor androgênico', 11, MUTED))
    gx = px + 120; top = py + 104
    o.append(cup(gx, top, 80, 38))
    o += ftalato(gx + 2, top - 3, 1.2)
    o.append(T(gx, py + 72, 'ftalato', 11, TEAL_D, italic=True, bold=True))
    o.append(T(gx, top + 54, 'receptor androgênico', 11, PURPLE_D))
    sx, sy = px + 292, py + 100
    o += steroid(sx, sy, 1.05)
    o.append(T(sx, py + 72, 'andrógeno', 11, AMBER_D, italic=True, bold=True))
    o.append(P(f'M{f(sx - 24)},{f(sy + 8)} C{f(sx - 50)},{f(sy + 14)} {f(gx + 80)},{f(top + 6)} {f(gx + 58)},{f(top + 4)}',
               AMBER, 2, dash='5 4', marker='i-r'))
    o.append(T(px + 254, top + 34, 'bloqueado', 11.5, RED_D, bold=True, italic=True))

    # ---- C: metabolismo ----
    px, py = C; cx = px + PW / 2
    o.append(T(cx, py + 24, 'Alteram o metabolismo hormonal', 14, AMBER, bold=True))
    o.append(T(cx, py + 42, 'enzimas da síntese ou do catabolismo dos esteroides', 11, MUTED))
    by = py + 84; bh = 36
    b1 = (px + 22, 92); b2 = (px + 254, 98)
    for (bx, bw), (l1, l2) in ((b1, ('enzimas da', 'síntese')), (b2, ('enzimas do', 'catabolismo'))):
        o.append(rect(bx, by, bw, bh, 8, F_AMBER, AMBER, 1.4))
        o.append(T(bx + bw / 2, by + 15, l1, 11, AMBER_D))
        o.append(T(bx + bw / 2, by + 29, l2, 11, AMBER_D, bold=True))
    scx = px + 186; scy = by + bh / 2
    o += steroid(scx, scy, 1.1)
    o.append(T(scx, by - 8, 'esteroide', 11, AMBER_D, italic=True, bold=True))
    o.append(P(f'M{f(b1[0] + b1[1] + 3)},{f(scy)} L{f(scx - 26)},{f(scy)}', AMBER, 2, marker='a-a'))
    o.append(P(f'M{f(scx + 26)},{f(scy)} L{f(b2[0] - 4)},{f(scy)}', AMBER, 2, marker='a-a'))
    dx, dy = scx, py + 146
    o += de_glyph(dx, dy, 13)
    o.append(P(f'M{f(dx - 15)},{f(dy - 2)} C{f(dx - 60)},{f(dy - 4)} {f(b1[0] + b1[1] / 2 + 10)},{f(dy)} {f(b1[0] + b1[1] / 2)},{f(by + bh + 5)}',
               TEAL, 1.8, dash='4 3', marker='a-t'))
    o.append(P(f'M{f(dx + 15)},{f(dy - 2)} C{f(dx + 60)},{f(dy - 4)} {f(b2[0] + b2[1] / 2 - 10)},{f(dy)} {f(b2[0] + b2[1] / 2)},{f(by + bh + 5)}',
               TEAL, 1.8, dash='4 3', marker='a-t'))
    o.append(T(dx - 70, dy + 16, 'alteram a expressão', 11, TEAL_D, italic=True))
    o.append(T(dx + 70, dy + 16, 'alteram a expressão', 11, TEAL_D, italic=True))

    # ---- D: além do receptor ----
    px, py = D; cx = px + PW / 2
    o.append(T(cx, py + 24, 'Agem além do receptor', 14, PURPLE, bold=True))
    o.append(T(cx, py + 42, 'transdução do sinal hormonal e fatores de transcrição', 11, MUTED))
    gx = px + 58; top = py + 98
    o.append(cup(gx, top, 70, 36))
    o += steroid(gx + 3, top - 4, 1.0)
    o.append(T(gx, top + 52, 'receptor', 11, PURPLE_D))
    wy = top + 18
    o.append(P(wave(gx + 40, px + 206, wy) + f' L{f(px + 222)},{f(wy)}', NAVY, 2, marker='a-n'))
    o.append(T(px + 156, top - 8, 'transdução do sinal', 11, NAVY, bold=True))
    d1x, d1y = px + 156, py + 150
    o += de_glyph(d1x, d1y, 12)
    o.append(P(f'M{f(d1x)},{f(d1y - 14)} L{f(d1x)},{f(wy + 9)}', TEAL, 1.8, dash='4 3', marker='a-t'))
    # DNA e fator de transcrição
    dna_y = py + 140
    o += dna(px + 230, px + 360, dna_y)
    tfx, tfy = px + 290, py + 114
    o.append(ell(tfx, tfy, 62, 15, F_PURPLE, PURPLE, 1.6))
    o.append(T(tfx, tfy + 4, 'fator de transcrição', 11, PURPLE_D, bold=True))
    o += de_glyph(tfx + 52, tfy - 22, 12)

    # ---- legenda ----
    ly = 452
    parts = []
    s1, s2, s3 = 'hormônio natural', 'disruptor endócrino (DE)', 'receptor hormonal'
    widths = [44 + tw(s1, 11), 32 + tw(s2, 11), 40 + tw(s3, 11)]
    x = 410 - (sum(widths) + 2 * 34) / 2
    o += steroid(x + 18, ly - 4, 0.9); o.append(T(x + 44, ly, s1, 11, MUTED, 'start'))
    x += widths[0] + 34
    o += de_glyph(x + 12, ly - 4, 12.5); o.append(T(x + 32, ly, s2, 11, MUTED, 'start'))
    x += widths[1] + 34
    o.append(cup(x + 16, ly - 12, 32, 16, 6, r=4, sw=1.4)); o.append(T(x + 40, ly, s3, 11, MUTED, 'start'))

    # ---- propriedades ----
    o.append(T(36, 486, 'Propriedades que explicam o dano', 12.5, INK, 'start', bold=True))
    chips = ['naturais ou sintéticos', 'lipofílicos: acumulam-se no tecido adiposo', 'efeito cumulativo',
             'atravessam a barreira placentária']
    ws = [tw(s, 11) + 24 for s in chips]
    gap = (756 - sum(ws)) / (len(chips) - 1)
    x = 36
    for s, w in zip(chips, ws):
        o.append(rect(x, 496, w, 26, 13, F_GREY, '#94a3b8', 1.2))
        o.append(T(x + w / 2, 513, s, 11, INK))
        x += w + gap
    nb, nh = note(28, 538, 764, [
        [('Pegadinha: ', {'bold': True}), ('é falso dizer que os disruptores agem ', None), ('exclusivamente como agonistas', {'bold': True}),
         (' — eles mimetizam, bloqueiam ou', None)],
        [('alteram o metabolismo dos hormônios naturais.', None)]])
    o += nb
    return o

if __name__ == '__main__':
    write(OUT, build())
    print('ok', OUT)
