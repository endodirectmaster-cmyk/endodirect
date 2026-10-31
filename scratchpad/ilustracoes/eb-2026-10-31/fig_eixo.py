from lib import *

OUT = '/home/user/endodirect/figuras/resumos/ilustracoes/endocrinologia-basica--eixo-alvo-trofico.svg'

def gauge(gx, cy, level, color):
    """medidor: fundo, faixa normal (verde-claro) e nível preenchido"""
    top, bot = cy - 25, cy + 25
    o = [rect(gx, top, 14, 50, 7, '#f1f5f9', '#cbd5e1', 1.2),
         rect(gx + 0.6, cy - 9, 12.8, 18, 0, '#d4ecd9'),
         L(gx - 3, cy - 9, gx + 17, cy - 9, GREEN, 1),
         L(gx - 3, cy + 9, gx + 17, cy + 9, GREEN, 1)]
    o.append(rect(gx + 4, level, 6, bot - 2 - level, 3, color))
    return o

def organ(cx, cy, name, status=None, kind='normal'):
    fill, stroke, dash, scol = {
        'normal': (F_GREY, MUTED, None, MUTED),
        'falha': (F_RED, RED, '5 3', RED_D),
        'autonoma': (F_AMBER, AMBER, None, AMBER_D)}[kind]
    o = [ell(cx, cy, 54, 22, fill, stroke, 1.8, dash)]
    if status:
        o.append(T(cx, cy - 2, name, 11.5, INK, bold=True))
        o.append(T(cx, cy + 13, status, 11, scol, italic=True, bold=True))
    else:
        o.append(T(cx, cy + 4, name, 11.5, INK, bold=True))
    return o

def build():
    H = 486
    o = header(H, 'Interpretar dentro do eixo: o trófico está adequado para o alvo?',
               ['O hormônio periférico (alvo) regula o hormônio hipofisário (trófico): pareie sempre alvo + trófico + clínica.'])
    PX = [28, 288, 548]; PW = 244; PY = 72; PH = 306
    cfg = [
        dict(title='Falha primária', sub='na glândula-alvo', color=RED, dark=RED_D,
             hip=('hipófise', None, 'normal'), alvo=('glândula-alvo', 'em falha', 'falha'),
             trof_lvl='alto', alvo_lvl='baixo',
             trof_txt=['alto ↑'], alvo_txt=['baixo ↓'],
             ex=['hipotireoidismo primário: TSH ↑', 'falência ovariana: FSH ↑', 'Addison: ACTH ↑']),
        dict(title='Falha central', sub='na hipófise ou no hipotálamo', color=PURPLE, dark=PURPLE_D,
             hip=('hipófise', 'em falha', 'falha'), alvo=('glândula-alvo', None, 'normal'),
             trof_lvl='inapropriado', alvo_lvl='baixo',
             trof_txt=['baixo ou', 'normal', 'inapropriado'], alvo_txt=['baixo ↓'],
             ex=['TSH 2,0 mUI/L com T4 livre baixo', 'é inapropriado: hipotireoidismo', 'central, não eutireoidismo']),
        dict(title='Excesso autônomo', sub='o alvo produz por conta própria', color=AMBER, dark=AMBER_D,
             hip=('hipófise', None, 'normal'), alvo=('glândula-alvo', 'autônoma', 'autonoma'),
             trof_lvl='suprimido', alvo_lvl='alto',
             trof_txt=['suprimido'], alvo_txt=['alto ↑'],
             ex=['Graves: TSH indetectável', 'nódulo tóxico: TSH suprimido']),
    ]
    LV = {'alto': -21, 'baixo': 15, 'inapropriado': 3, 'suprimido': 20}
    for px, c in zip(PX, cfg):
        cx = px + PW / 2
        o.append(panel(px, PY, PW, PH))
        o.append(T(cx, PY + 24, c['title'], 15, c['color'], bold=True))
        o.append(T(cx, PY + 42, c['sub'], 11, MUTED))
        ox = px + 68; hy = PY + 88; ay = PY + 188
        # setas: trófico estimula (desce) e alvo regula (sobe, inibição)
        strong_t = c['trof_lvl'] == 'alto'; weak_t = c['trof_lvl'] == 'suprimido'
        o.append(P(f'M{f(ox - 18)},{f(hy + 25)} L{f(ox - 18)},{f(ay - 26)}', NAVY, 3 if strong_t else 1.6,
                   dash='4 3' if weak_t else None, marker='a-n'))
        strong_f = c['alvo_lvl'] == 'alto'
        o.append(P(f'M{f(ox + 18)},{f(ay - 25)} L{f(ox + 18)},{f(hy + 28)}', RED, 3 if strong_f else 1.6,
                   dash=None if strong_f else '4 3', marker='i-r'))
        o += organ(ox, hy, *c['hip'])
        o += organ(ox, ay, *c['alvo'])
        # medidores
        gx = px + 136
        for cy, lvl, words, lab in ((hy, c['trof_lvl'], c['trof_txt'], 'trófico'), (ay, c['alvo_lvl'], c['alvo_txt'], 'alvo')):
            o += gauge(gx, cy, cy + LV[lvl], c['color'])
            n = len(words)
            y0 = cy - 6 - 7 * (n - 1)
            o.append(T(gx + 24, y0, lab, 11, MUTED, 'start'))
            for i, w in enumerate(words):
                o.append(T(gx + 24, y0 + 16 + 14 * i, w, 12.5 if n == 1 else 12, c['dark'], 'start', bold=True))
        # exemplos
        o.append(L(px + 18, PY + 236, px + PW - 18, PY + 236, LINE, 1.2))
        o.append(T(cx, PY + 253, 'exemplos', 11, MUTED, italic=True))
        for i, e in enumerate(c['ex']):
            o.append(T(cx, PY + 271 + 15 * i, e, 11, INK, italic=True))
    # legenda
    ly = 402
    items = []
    x = 0
    def leg_arrow(x):
        return [P(f'M{f(x)},{ly - 4} L{f(x + 26)},{ly - 4}', NAVY, 2, marker='a-n')], 30
    def leg_inib(x):
        return [P(f'M{f(x)},{ly - 4} L{f(x + 24)},{ly - 4}', RED, 2, marker='i-r')], 30
    def leg_gauge(x):
        return [rect(x, ly - 13, 12, 18, 0, '#d4ecd9'), L(x - 2, ly - 13, x + 14, ly - 13, GREEN, 1), L(x - 2, ly + 5, x + 14, ly + 5, GREEN, 1)], 20
    entries = [(leg_arrow, 'trófico estimula a glândula-alvo'), (leg_inib, 'o alvo regula o trófico (retroalimentação)'), (leg_gauge, 'faixa normal')]
    total = sum(fn(0)[1] + tw(s, 11) for fn, s in entries) + 30 * (len(entries) - 1)
    x = 410 - total / 2
    for fn, s in entries:
        g, w = fn(x)
        o += g
        o.append(T(x + w, ly, s, 11, MUTED, 'start'))
        x += w + tw(s, 11) + 30
    nb, nh = note(28, 420, 764, [
        [('Um hormônio “normal” pode ser inadequado para o contexto: ', None), ('o laboratório em endocrinologia é interpretado', {'bold': True})],
        [('dentro do eixo, nunca isoladamente.', {'bold': True})]])
    o += nb
    return o

if __name__ == '__main__':
    write(OUT, build())
    print('ok', OUT)
