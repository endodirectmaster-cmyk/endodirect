from lib import *

OUT = '/home/user/endodirect/figuras/resumos/ilustracoes/endocrinologia-basica--hormonio-livre-total.svg'

HORM_F, HORM_S = '#efc96a', AMBER

def bound(cx, cy):
    return [ell(cx, cy, 17, 11, F_PURPLE, PURPLE, 1.5), circ(cx, cy, 5, HORM_F, HORM_S, 1.4)]

def free(cx, cy):
    return [circ(cx, cy, 10, F_GREEN, GREEN, 1.3, '2.5 2'), circ(cx, cy, 5, HORM_F, HORM_S, 1.4)]

def build():
    H = 470
    o = header(H, 'Hormônio livre × total: quando a carreadora muda, o total engana',
               ['Só a fração livre é biologicamente ativa; ela continua sendo a leitura correta quando a proteína carreadora muda.'])
    PX = [28, 288, 548]; PW = 244; PY = 72; PH = 298
    cols = [46, 92, 138, 184]; rows = [26, 60, 94]   # relativos ao reservatório
    FREE = [(1, 1), (3, 1)]
    cfg = [
        dict(title='Carreadoras normais', color=NAVY, dark=NAVY, sub=['situação de referência', ''],
             bound=[(0, 0), (2, 0), (0, 2), (2, 2)],
             st1='total = ligado + livre', st2='só a fração livre é ativa'),
        dict(title='Carreadoras aumentadas', color=BLUE, dark=BLUE_D,
             sub=['estrogênio, gravidez, anticoncepcional', '↑ TBG, SHBG e CBG'],
             bound=[(0, 0), (1, 0), (2, 0), (3, 0), (0, 1), (2, 1), (1, 2), (3, 2)],
             st1='o total sobe sem doença', st2='a fração livre permanece a leitura correta'),
        dict(title='Carreadoras reduzidas', color=AMBER, dark=AMBER_D,
             sub=['síndrome nefrótica, desnutrição,', 'andrógenos'],
             bound=[(0, 0), (2, 2)],
             st1='o total cai', st2='a fração livre permanece a leitura correta'),
    ]
    for px, c in zip(PX, cfg):
        cx = px + PW / 2
        o.append(panel(px, PY, PW, PH))
        o.append(T(cx, PY + 24, c['title'], 14.5, c['color'], bold=True))
        for i, s in enumerate(c['sub']):
            if s:
                o.append(T(cx, PY + 42 + 14 * i, s, 11, MUTED if i == 0 or not s.startswith('↑') else c['dark'], bold=s.startswith('↑')))
        # reservatório
        ry = PY + 66
        o.append(rect(px + 16, ry, PW - 32, 120, 12, '#ffffff', '#cbd5e1', 1.2))
        for (ci, ri) in c['bound']:
            o += bound(px + cols[ci] + 4, ry + rows[ri] + 4)
        for (ci, ri) in FREE:
            o += free(px + cols[ci] + 4, ry + rows[ri] + 4)
        # barras total x livre
        nb = len(c['bound']); nf = len(FREE); u = 15
        bx = px + 64
        for k, (lab, y) in enumerate((('total', ry + 140), ('livre', ry + 162))):
            o.append(T(px + 22, y + 9.5, lab, 11.5, INK, 'start', bold=True))
            if lab == 'total':
                o.append(rect(bx, y, nb * u, 12, 2, F_PURPLE, PURPLE, 1.2))
                o.append(rect(bx + nb * u, y, nf * u, 12, 2, F_GREEN, GREEN, 1.2))
            else:
                o.append(rect(bx, y, nf * u, 12, 2, F_GREEN, GREEN, 1.2))
        o.append(T(cx, PY + 266, c['st1'], 12, c['dark'], bold=True))
        o.append(T(cx, PY + 283, c['st2'], 11, INK, italic=True))
    # legenda
    ly = 392
    g1 = bound(0, 0); g2 = free(0, 0)
    s1 = 'hormônio ligado à proteína carreadora'; s2 = 'hormônio livre (fração ativa)'
    total = 40 + tw(s1, 11) + 40 + 30 + tw(s2, 11)
    x = 410 - total / 2
    o += bound(x + 17, ly - 4); o.append(T(x + 40, ly, s1, 11, MUTED, 'start'))
    x2 = x + 40 + tw(s1, 11) + 40
    o += free(x2 + 10, ly - 4); o.append(T(x2 + 26, ly, s2, 11, MUTED, 'start'))
    nb_, nh = note(28, 408, 764, [
        [('Soluções práticas: ', {'bold': True}), ('T4 livre; testosterona livre/biodisponível ou cálculo por SHBG + albumina;', None)],
        [('cálcio corrigido = Ca medido + 0,8 × (4 − albumina g/dL), ou cálcio iônico direto.', None)]])
    o += nb_
    return o

if __name__ == '__main__':
    write(OUT, build())
    print('ok', OUT)
