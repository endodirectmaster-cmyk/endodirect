# Corrige rótulos errados nas figuras de tireoide, obesidade e osteometabolismo (lote enviado
# pelo professor em 18/10/2026), antes de publicar. Só onde o erro muda o sentido, contradiz o
# capítulo ou é erro de grafia evidente; formas estranhas mas corretas do livro ficam como
# estão. Coordenadas em pixels da imagem dos zips _PT. A maquinaria é a do corrige-diabetes.py:
#   - copia: reaproveita um glifo da própria figura;
#   - troca: acha a Liberation Sans (normal ou negrito), o corpo, a espessura, o desfoque e a
#     posição que reproduzem a palavra errada pixel a pixel, apaga e escreve a certa com os
#     mesmos parâmetros, na mesma linha de base;
#   - limpa: cobre uma região com uma cor (ou a do fundo em volta);
#   - junta: depois de uma troca que encurtou a palavra, puxa o resto da linha para manter o
#     espaço que havia entre as palavras;
#   - linhas: pinta cada linha da caixa com a cor média da faixa de amostra da mesma linha
#     (fundo em degradê, como dentro de um balão);
#   - replica: repete numa faixa de linhas o trecho de uma linha de referência (borda de painel).
#   python corrige-tob.py <pasta extraido (tireoide, obesidade, osteo)> <pasta de saída>
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ORIG, SAIDA = sys.argv[1:3]
FONTES = {False: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
          True: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'}
_fontes = {}
def fonte(negrito, t):
    if (negrito, t) not in _fontes: _fontes[negrito, t] = ImageFont.truetype(FONTES[negrito], t)
    return _fontes[negrito, t]

def fundo_de(a, caixa):
    x0, y0, x1, y1 = caixa
    borda = np.concatenate([a[y0, x0:x1], a[y1 - 1, x0:x1], a[y0:y1, x0], a[y0:y1, x1 - 1]])
    claro = borda[borda.mean(axis=1) >= np.percentile(borda.mean(axis=1), 40)]
    return tuple(int(v) for v in np.median(claro, axis=0))

def tinta_em(a, caixa, fundo):
    x0, y0, x1, y1 = caixa
    sub = a[y0:y1, x0:x1].reshape(-1, 3); L = sub.mean(axis=1)
    m = L < min(150, np.mean(fundo) - 50)
    return m.reshape(y1 - y0, x1 - x0)

def limpa(im, caixa, cor=None):
    a = np.asarray(im).astype(int)
    cor = cor or fundo_de(a, caixa)
    ImageDraw.Draw(im).rectangle([caixa[0], caixa[1], caixa[2] - 1, caixa[3] - 1], fill=cor)

def copia(im, de, para):
    im.paste(im.crop(de), para)

def reordena(im, x0, x1, acima, abaixo, movimentos):
    # leva linhas de texto inteiras (a faixa x0–x1, de `acima` px sobre a linha de base a
    # `abaixo` px sob ela) de uma linha de base para outra: [(base de origem, base de destino)]
    a = np.asarray(im).astype(int)
    pecas = [(im.crop((x0, b - acima, x1, b + abaixo)), d) for b, d in movimentos]
    bases = [b for b, _ in movimentos] + [d for _, d in movimentos]
    regiao = (x0, min(bases) - acima, x1, max(bases) + abaixo)
    limpa(im, regiao, fundo_de(a, regiao))
    for p, d in pecas: im.paste(p, (x0, d - acima))

def desfoca(a, s):
    if s <= 0: return a
    r = int(np.ceil(3 * s)); x = np.arange(-r, r + 1); k = np.exp(-x * x / (2 * s * s)); k /= k.sum()
    h, w = a.shape
    b = np.pad(a, ((0, 0), (r, r))); a = sum(k[i] * b[:, i:i + w] for i in range(2 * r + 1))
    b = np.pad(a, ((r, r), (0, 0))); return sum(k[i] * b[i:i + h] for i in range(2 * r + 1))

S = 8   # o texto é desenhado a 8× e reduzido: posição e espessura em 1/8 de pixel

def tela(texto, negrito, t, s, ax, ay, w, h, M=0):
    c = Image.new('L', (w * S + 2 * M, h * S + 2 * M), 0)
    ImageDraw.Draw(c).text((ax + M, ay + M), texto, font=fonte(negrito, t), fill=255, anchor='ls', stroke_width=s, stroke_fill=255)
    return np.asarray(c, dtype=np.float32) / 255

def reduz(c, dx, dy, w, h, sigma, M=0):
    # cobertura (0–1) na região w×h, com o texto deslocado de (dx, dy) em 1/8 de pixel
    return desfoca(c[M - dy:M - dy + h * S, M - dx:M - dx + w * S].reshape(h, S, w, S).mean(axis=(1, 3)), sigma)

def alfa(texto, negrito, t, s, sigma, ax, ay, w, h):
    return reduz(tela(texto, negrito, t, s, ax, ay, w, h), 0, 0, w, h, sigma)

def ajusta(a, regiao, texto, fundo, X0, Y1):
    R0, R1, R2, R3 = regiao; w, h = R2 - R0, R3 - R1
    D = a[R1:R3, R0:R2].astype(float) - np.array(fundo, float)
    # cor da tinta fixa (a dos 2% de pixels mais escuros): soltar a cor deixa o ajuste trocar
    # traço fino e escuro por traço grosso e claro, que dá quase o mesmo erro
    px = D.reshape(-1, 3); g = px[np.argsort(px.sum(axis=1))[: max(5, len(px) // 50)]].mean(axis=0)
    tinta = np.clip((D @ g) / (g @ g), 0, 1).sum()   # quanta tinta a palavra original tem
    def erro(al):
        return ((D - al[..., None] * g) ** 2).sum()
    def ancora(negrito, t, s):
        l, _, _, b = fonte(negrito, t).getbbox(texto, anchor='ls', stroke_width=s)
        return (X0 - R0) * S - l, (Y1 + 1 - R1) * S - b
    def corpo(negrito, s):
        larg = (D.mean(axis=2) < -40).any(axis=0).nonzero()[0]
        larg = (larg.max() - larg.min() + 1) * S
        t = 8
        while True:
            l, _, r, _ = fonte(negrito, t).getbbox(texto, anchor='ls', stroke_width=s)
            if r - l >= larg or t > 800: return t
            t += 1
    M = 4 * S
    # 1ª passada, grossa: fonte, espessura, corpo, desfoque e posição
    melhor = (np.inf,)
    for negrito in (False, True):
        for s in (0, 2, 4):
            t0 = corpo(negrito, s)
            for t in range(t0 - 6, t0 + 7, 2):
                ax, ay = ancora(negrito, t, s)
                c = tela(texto, negrito, t, s, ax, ay, w, h, M)
                for sigma in (0.4, 0.6, 0.8, 1.0):
                    for dx in range(-12, 13, 4):
                        for dy in range(-12, 13, 4):
                            e = erro(reduz(c, dx, dy, w, h, sigma, M))
                            if e < melhor[0]: melhor = (e, negrito, t, s, sigma, ax + dx, ay + dy)
    # 2ª passada, fina, em volta da melhor; entre as quase tão boas quanto ela (erro até 4%
    # maior), fica a que tem a mesma quantidade de tinta do original: o erro quadrático sozinho
    # puxa para traços mais claros quando as letras da fonte não coincidem com as do livro
    _, negrito, t1, s1, sg1, ax1, ay1 = melhor
    cands = []
    for s in range(max(0, s1 - 2), s1 + 3):
        for t in range(t1 - 3, t1 + 4):
            c = tela(texto, negrito, t, s, ax1, ay1, w, h, M)
            for sigma in (sg1 - 0.1, sg1, sg1 + 0.1):
                if sigma < 0.2: continue
                for dx in range(-3, 4):
                    for dy in range(-3, 4):
                        al = reduz(c, dx, dy, w, h, sigma, M)
                        cands.append((erro(al), abs(al.sum() / tinta - 1), t, s, sigma, ax1 + dx, ay1 + dy))
    emin = min(x[0] for x in cands)
    e, dtinta, t, s, sigma, ax, ay = min((x for x in cands if x[0] <= emin * 1.04), key=lambda x: x[1])
    al = alfa(texto, negrito, t, s, sigma, ax, ay, w, h)
    cor = tuple(int(np.clip(fundo[i] + g[i], 0, 255)) for i in range(3))
    rel = 1 - e / (D ** 2).sum()                      # fração da tinta explicada pelo modelo
    return dict(negrito=negrito, t=t, s=s, sigma=sigma, ax=ax, ay=ay, cor=cor, rel=rel, alfa=al,
                tinta=round(al.sum() / tinta, 3))

def troca(im, caixa, antigo, novo, alinhar='centro', arrasta=None):
    a = np.asarray(im).astype(int)
    fundo = fundo_de(a, caixa)
    m = tinta_em(a, caixa, fundo)
    ys, xs = np.nonzero(m)
    X0, Y0, X1, Y1 = caixa[0] + xs.min(), caixa[1] + ys.min(), caixa[0] + xs.max(), caixa[1] + ys.max()
    regiao = (X0 - 4, Y0 - 4, X1 + 5, Y1 + 5)
    p = ajusta(a, regiao, antigo, fundo, X0, Y1)
    f = fonte(p['negrito'], p['t'])
    ol, _, orr, _ = f.getbbox(antigo, anchor='ls', stroke_width=p['s'])
    nl, nt, nr, nb = f.getbbox(novo, anchor='ls', stroke_width=p['s'])
    if alinhar == 'esq': nax = p['ax'] + ol - nl
    elif alinhar == 'dir': nax = p['ax'] + orr - nr
    else: nax = p['ax'] + (ol + orr) / 2 - (nl + nr) / 2
    # apaga a palavra antiga: onde o modelo dela tem tinta, com 1 px de folga
    ys, xs = np.nonzero(p['alfa'] > 0.01)
    apaga = (regiao[0] + xs.min() - 1, regiao[1] + ys.min() - 1, regiao[0] + xs.max() + 2, regiao[1] + ys.max() + 2)
    limpa(im, apaga, fundo)
    k = 0
    if arrasta:
        k = int(round(((nr - nl) - (orr - ol)) / (2 * S)))   # meia diferença, em pixels
        pedaco = im.crop(arrasta); limpa(im, arrasta, fundo_de(a, arrasta)); im.paste(pedaco, (arrasta[0] - k, arrasta[1]))
        nax -= S * k
    # escreve a nova numa tela que cobre a extensão dela
    AX, AY = regiao[0] * S + nax, regiao[1] * S + p['ay']
    cx0, cy0 = int(np.floor((AX + nl) / S)) - 5, int(np.floor((AY + nt) / S)) - 5
    cx1, cy1 = int(np.ceil((AX + nr) / S)) + 5, int(np.ceil((AY + nb) / S)) + 5
    al = alfa(novo, p['negrito'], p['t'], p['s'], p['sigma'], AX - cx0 * S, AY - cy0 * S, cx1 - cx0, cy1 - cy0)
    atual = np.asarray(im.crop((cx0, cy0, cx1, cy1))).astype(float)
    novo_px = atual * (1 - al[..., None]) + np.array(p['cor'], float) * al[..., None]
    im.paste(Image.fromarray(np.clip(np.round(novo_px), 0, 255).astype(np.uint8)), (cx0, cy0))
    return dict(palavra=(X0, Y0, X1, Y1), apaga=apaga, arrasta=-k, fonte='negrito' if p['negrito'] else 'normal',
                corpo=p['t'] / S, espessura=p['s'] / S, desfoque=round(p['sigma'], 2), tinta=p['cor'], fundo=fundo,
                ajuste=round(p['rel'], 3), tinta_rel=p['tinta'], novo=(cx0, cy0, cx1, cy1))

def junta(im, palavra, resto, espaco):
    # leva o resto da linha (caixa `resto`) para a esquerda até ficar a `espaco` px da tinta
    # da palavra trocada (caixa `palavra`)
    a = np.asarray(im).astype(int)
    m = tinta_em(a, palavra, fundo_de(a, palavra)); fim = palavra[0] + np.nonzero(m.any(axis=0))[0].max()
    mr = tinta_em(a, resto, fundo_de(a, resto)); ini = resto[0] + np.nonzero(mr.any(axis=0))[0].min()
    d = ini - (fim + 1 + espaco)
    if d <= 0: return 0
    pedaco = im.crop(resto); limpa(im, resto, fundo_de(a, resto)); im.paste(pedaco, (resto[0] - d, resto[1]))
    return d

def linhas(im, caixa, amostra):
    a = np.asarray(im).astype(int); d = ImageDraw.Draw(im)
    for y in range(caixa[1], caixa[3]):
        cor = tuple(int(v) for v in a[y, amostra[0]:amostra[1]].mean(axis=0))
        d.line([(caixa[0], y), (caixa[2] - 1, y)], fill=cor)

def contraste(im, caixa, alvo):
    # texto reescrito mais claro que o original (o ajuste escolheu traço mais desfocado):
    # escurece a cobertura (alfa ** g) até a tinta média ficar como a do texto original
    a = np.asarray(im).astype(float)
    fundo = np.array(fundo_de(a.astype(int), caixa), float)
    x0, y0, x1, y1 = caixa; sub = a[y0:y1, x0:x1]
    L = sub.mean(axis=2); tinta = sub.reshape(-1, 3)[np.argsort(L.ravel())[: max(5, L.size // 100)]].mean(axis=0)
    al = np.clip((fundo.mean() - L) / (fundo.mean() - tinta.mean()), 0, 1)
    def media(g):
        Lg = fundo.mean() - al ** g * (fundo.mean() - tinta.mean()); v = Lg[Lg < 128]; return v.mean() if v.size else 255
    lo, hi = 0.2, 1.0
    for _ in range(30):
        g = (lo + hi) / 2
        if media(g) > alvo: hi = g
        else: lo = g
    novo = fundo - (al ** g)[..., None] * (fundo - tinta)
    im.paste(Image.fromarray(np.clip(np.round(novo), 0, 255).astype(np.uint8)), (x0, y0))
    return round(g, 3)

def nitidez(im, caixa, a0, a1):
    # texto reescrito mais desfocado que o original: a cobertura (alfa) passa por uma rampa
    # (abaixo de a0 vira fundo, acima de a1 vira tinta cheia), o que afina a borda sem
    # engrossar o traço
    a = np.asarray(im).astype(float)
    fundo = np.array(fundo_de(a.astype(int), caixa), float)
    x0, y0, x1, y1 = caixa; sub = a[y0:y1, x0:x1]
    L = sub.mean(axis=2); tinta = sub.reshape(-1, 3)[np.argsort(L.ravel())[: max(5, L.size // 100)]].mean(axis=0)
    al = np.clip((fundo.mean() - L) / (fundo.mean() - tinta.mean()), 0, 1)
    al = np.clip((al - a0) / (a1 - a0), 0, 1)
    novo = fundo - al[..., None] * (fundo - tinta)
    im.paste(Image.fromarray(np.clip(np.round(novo), 0, 255).astype(np.uint8)), (x0, y0))

def desloca(im, caixa, dx, amostra):
    # anda o conteúdo da caixa dx px na horizontal; a faixa que fica vaga recebe, linha a
    # linha, a cor média das colunas de amostra (fundo em degradê)
    a = np.asarray(im).astype(int); x0, y0, x1, y1 = caixa
    pedaco = im.crop(caixa); linhas(im, caixa, amostra); im.paste(pedaco, (x0 + dx, y0))
    if dx < 0: linhas(im, (x1 + dx, y0, x1, y1), amostra)

def move(im, caixa, dx, dy, cor):
    pedaco = im.crop(caixa); limpa(im, caixa, cor); im.paste(pedaco, (caixa[0] + dx, caixa[1] + dy))

def risco(im, p0, p1, r=2.5, lim=110):
    # apaga uma linha de chamada fina (sem rótulo) de p0 a p1: ajusta a reta aos pixels
    # escuros perto do traçado aproximado e troca cada pixel da faixa pela média das duas
    # amostras perpendiculares, de um lado e do outro (pele, roupa ou fundo continuam)
    a = np.asarray(im).astype(float); L = a.mean(axis=2); h, w = L.shape
    (x0, y0), (x1, y1) = p0, p1
    d = np.array([x1 - x0, y1 - y0], float); comp = np.hypot(*d); u = d / comp; n = np.array([-u[1], u[0]])
    bx0, bx1 = int(max(0, min(x0, x1) - 8)), int(min(w, max(x0, x1) + 9)); by0, by1 = int(max(0, min(y0, y1) - 8)), int(min(h, max(y0, y1) + 9))
    ys, xs = np.mgrid[by0:by1, bx0:bx1]
    rel = np.stack([xs - x0, ys - y0], -1).astype(float)
    t = rel @ u; dist = rel @ n
    perto = (np.abs(dist) < 5) & (t > -4) & (t < comp + 4) & (L[by0:by1, bx0:bx1] < lim)
    px, py = xs[perto].astype(float), ys[perto].astype(float)
    # reta ajustada (mínimos quadrados na direção perpendicular)
    c = np.array([px.mean(), py.mean()])
    q = np.stack([px - c[0], py - c[1]], -1); _, _, vt = np.linalg.svd(q, full_matrices=False); u2 = vt[0]; n2 = np.array([-u2[1], u2[0]])
    tt = q @ u2; t0, t1 = tt.min() - 1.5, tt.max() + 1.5
    rel2 = np.stack([xs - c[0], ys - c[1]], -1).astype(float)
    T = rel2 @ u2; D = rel2 @ n2
    faixa = (np.abs(D) <= r) & (T >= t0) & (T <= t1)
    out = a.copy(); k = r + 2.5
    for yy, xx in zip(ys[faixa], xs[faixa]):
        dd = (np.array([xx, yy], float) - c) @ n2
        base = np.array([xx, yy], float) - dd * n2
        amostras = []
        for sgn in (1, -1):
            sx, sy = base + sgn * k * n2
            ix, iy = int(round(sx)), int(round(sy))
            if 0 <= ix < w and 0 <= iy < h and L[iy, ix] >= lim: amostras.append(a[iy, ix])
        if amostras: out[yy, xx] = np.mean(amostras, axis=0)
    im.paste(Image.fromarray(np.clip(np.round(out), 0, 255).astype(np.uint8)))
    return (round(c[0] + t0 * u2[0]), round(c[1] + t0 * u2[1])), (round(c[0] + t1 * u2[0]), round(c[1] + t1 * u2[1])), int(faixa.sum())

def replica(im, xs, y_ref, ys):
    faixa = im.crop((xs[0], y_ref, xs[1], y_ref + 1))
    for y in range(ys[0], ys[1]): im.paste(faixa, (xs[0], y))

def traco(im, p0, p1, larg, cor, claro=200):
    # refaz um trecho de curva que um rótulo de fundo branco apagou: reta de largura `larg`,
    # desenhada a 8× e reduzida (borda suave), pintada só sobre pixels claros (o rótulo e o
    # resto da curva ficam como estão)
    x0, y0 = int(min(p0[0], p1[0]) - larg - 2), int(min(p0[1], p1[1]) - larg - 2)
    x1, y1 = int(max(p0[0], p1[0]) + larg + 3), int(max(p0[1], p1[1]) + larg + 3)
    w, h = x1 - x0, y1 - y0
    c = Image.new('L', (w * S, h * S), 0); d = ImageDraw.Draw(c); r = larg * S / 2
    q0, q1 = ((p0[0] - x0) * S, (p0[1] - y0) * S), ((p1[0] - x0) * S, (p1[1] - y0) * S)
    d.line([q0, q1], fill=255, width=int(round(larg * S)))
    for q in (q0, q1): d.ellipse([q[0] - r, q[1] - r, q[0] + r, q[1] + r], fill=255)
    al = np.asarray(c, dtype=np.float32).reshape(h, S, w, S).mean(axis=(1, 3)) / 255
    atual = np.asarray(im.crop((x0, y0, x1, y1))).astype(float)
    al = al * (atual.mean(axis=2) >= claro)
    novo = atual * (1 - al[..., None]) + np.array(cor, float) * al[..., None]
    im.paste(Image.fromarray(np.clip(np.round(novo), 0, 255).astype(np.uint8)), (x0, y0))
    return int((al > 0.5).sum())

def permuta(im, faixa, regiao, pecas):
    # troca letras de lugar na mesma linha, com os glifos da própria figura (texto borrado do
    # livro, que uma fonte redesenhada não imita): recorta cada peça [(x0, x1, destino)] da
    # faixa de linhas, pinta a região com o fundo e cola as peças nos destinos
    a = np.asarray(im).astype(int); y0, y1 = faixa
    cortes = [(im.crop((x0, y0, x1, y1)), d) for x0, x1, d in pecas]
    limpa(im, (regiao[0], y0, regiao[1], y1), fundo_de(a, (regiao[0], y0, regiao[1], y1)))
    for c, d in cortes: im.paste(c, (d, y0))

def refundo(im, interior, y_ref, texto, dx=0, dy=0):
    # remendo da tradução (retângulo liso ou branco por cima do degradê da caixa): o texto sai
    # como cobertura sobre o fundo do remendo, o interior volta a ter o degradê da linha de
    # referência, e o texto é recolocado, deslocado de (dx, dy) quando estava fora do centro
    a = np.asarray(im).astype(float)
    x0, y0, x1, y1 = texto
    sub = a[y0:y1, x0:x1]; L = sub.mean(axis=2)
    fundo = np.percentile(L, 90)
    tinta = sub.reshape(-1, 3)[np.argsort(L.ravel())[: max(5, L.size // 100)]].mean(axis=0)
    al = np.clip((fundo - L) / (fundo - tinta.mean()), 0, 1)
    al[al < 0.08] = 0   # a borda arredondada do remendo não é texto
    replica(im, (interior[0], interior[2]), y_ref, (interior[1], interior[3]))
    b = np.asarray(im).astype(float)
    reg = b[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
    novo = reg * (1 - al[..., None]) + tinta * al[..., None]
    im.paste(Image.fromarray(np.clip(np.round(novo), 0, 255).astype(np.uint8)), (x0 + dx, y0 + dy))

def gira(im, caixa, ops, nome):
    # rótulo vertical, lido de baixo para cima: a caixa gira 90° no sentido horário, as
    # operações usam as coordenadas da caixa girada, e ela volta ao lugar
    c = im.crop(caixa).transpose(Image.ROTATE_270)
    c = aplica(c, ops, nome + ' (girada)')
    im.paste(c.transpose(Image.ROTATE_90), caixa[:2])

CORRECOES = {
    # Apovian 2.6 (ações do GLP-1): no coração, a tradução pôs "Captação de glicose ↓"; o GLP-1
    # AUMENTA a captação miocárdica de glicose. A seta ↑ do rótulo de cima (mesma fonte e
    # corpo) é copiada por cima.
    'obesidade/06_tratamento_clinico_e_farmacologico/acoes_do_glp1_e_dos_agonistas_na_perda_de_peso__ClinicalManagementObesity_p37_PT.png': [
        ('limpa', (439, 180, 453, 203)), ('copia', (497, 145, 511, 168), (439, 180))],
    # Netter 2-16 (causas de hipotireoidismo): "Após tireoidite aguda" — a aguda (supurativa)
    # raramente deixa hipotireoidismo; a causa é a tireoidite subaguda (caps. 78 e 85).
    'tireoide/03_hipotireoidismo/causas_de_hipotireoidismo_primario_e_central__Netter_p64_PT.png': [
        ('troca', (272, 1100, 596, 1142), 'Após tireoidite aguda', 'Após tireoidite subaguda', 'centro')],
    # Apovian 3.1 (comorbidades): nomes atuais (DHEM e SOMP) e a lista de cânceres sem colo do
    # útero e próstata, que não estão na lista da IARC seguida pelo cap. 71.
    'obesidade/05_complicacoes/comorbidades_associadas_a_obesidade__ClinicalManagementObesity_p50_PT.png': [
        ('troca', (28, 290, 659, 329), 'Doença hepática gordurosa não alcoólica', 'Doença hepática esteatótica metabólica', 'dir'),
        ('troca', (188, 688, 776, 731), 'Síndrome dos ovários policísticos', 'SOMP (antiga SOP)', 'esq'),
        ('troca', (1338, 612, 2056, 652), 'Mama, útero, colo do útero, cólon, esôfago,', 'Mama, útero, cólon, esôfago,', 'esq'),
        ('troca', (1338, 653, 1745, 692), 'pâncreas, rim, próstata', 'pâncreas, rim', 'esq'),
        # o ajuste escolheu traço mais desfocado que o do livro e o texto novo saiu mais claro
        ('nitidez', (30, 292, 660, 330), 0.12, 0.72), ('nitidez', (190, 690, 780, 731), 0.12, 0.72),
        ('nitidez', (1340, 612, 2056, 652), 0.12, 0.72), ('nitidez', (1340, 653, 1745, 692), 0.12, 0.72)],
    # Vilar 31.1 (bócio nodular tóxico): "Prejuizo" sem acento e "no gente da Gsα" (gene).
    'tireoide/04_hipertireoidismo_graves/patogenese_do_bocio_nodular_toxico__Vilar_p532.png': [
        ('troca', (58, 222, 194, 262), 'Prejuizo', 'Prejuízo', 'esq'),
        ('troca', (750, 636, 844, 678), 'gente', 'gene', 'esq'),
        ('junta', (750, 636, 846, 678), (846, 636, 966, 680), 13)],
    # Williams 12.10 (receptor do TSH na orbitopatia): "P13K" → PI3K. O "1" vira "I": sai a
    # bandeira do algarismo e fica a haste; o fundo do balão (degradê) vem da mesma linha.
    'tireoide/04_hipertireoidismo_graves/receptor_do_tsh_na_imunopatogenese_da_orbitopatia__Williams_p471_PT.png': [
        ('linhas', (780, 326, 783, 332), (777, 779)),
        # sem a bandeira, o "I" ficou 2 px mais longe do "P" que o normal: "I3K" anda 2 px
        ('desloca', (783, 324, 816, 343), -2, (816, 818)),
        # o alto da haste levou junto a borda esquerda do "1": refaz com o perfil da haste
        ('replica', (781, 784), 335, (327, 332))],
    # Golan 26.5 (antitireoidianos): "Tioaminas" → Tionamidas, como no cap. 80.
    'tireoide/04_hipertireoidismo_graves/sitios_de_acao_dos_farmacos_antitireoidianos__Golan_p450.png': [
        ('troca', (774, 558, 950, 590), 'Tioaminas', 'Tionamidas', 'esq')],
    # Vilar 76.1 (história natural da DHEM): "Esteatose (≥ 5% de gordura)" repetido sob o
    # fígado saudável; o rótulo certo é o de baixo da esteatose simples.
    'obesidade/05_complicacoes/historia_natural_da_doenca_hepatica_esteatotica__Vilar_p1386.png': [
        ('limpa', (56, 293, 137, 311), (255, 255, 255)), ('limpa', (26, 311, 170, 335), (255, 255, 255))],
    # Essencial 89.5 (Scopinaro): "Alça biliodigestiva" → biliopancreática, como no desenho ao
    # lado; e o "o" de "íleo", cortado no recorte do livro, volta.
    'obesidade/07_cirurgia_bariatrica_metabolica/derivacao_biliopancreatica_de_scopinaro__Essencial_p1219.png': [
        ('troca', (966, 297, 1140, 321), 'Alça biliodigestiva,', 'Alça biliopancreática,', 'esq'),
        ('troca', (966, 365, 1150, 388), 'grande parte do ílec', 'grande parte do íleo', 'esq')],
    # Igaz 24.2 (DXA): sai o aviso do densitômetro ("Imagem apenas para avaliação de fratura
    # atípica de fêmur"), numa caixa que vaza da borda do painel b.
    'osteo/02_osteoporose_fisiopatologia_diagnostico/imagens_de_dxa_coluna_femur_e_radio__Igaz_p263_PT.png': [
        ('replica', (820, 842), 890, (900, 927)), ('limpa', (842, 900, 1198, 927), (8, 8, 8)),
        ('limpa', (825, 927, 1198, 932), (255, 255, 255))],
    # Vilar 86.7 (laudo da DXA): o escore Z compara com a média da MESMA IDADE, não "para
    # adultos" (o T é que compara com adultos jovens).
    'osteo/02_osteoporose_fisiopatologia_diagnostico/laudo_de_densitometria_da_coluna_lombar_t_score__Vilar_p1540.png': [
        ('troca', (815, 1521, 936, 1553), 'adultos', 'a idade', 'centro')],
    # Netter 6-4 (fisiopatologia do HPTP): adenoma 93%, hiperplasia 6% e carcinoma 1% no
    # livro; o cap. 104 dá 80–85%, 10–15% e < 1%, e a figura entra logo depois desses números.
    'osteo/04_hiperparatireoidismo/fisiopatologia_do_hiperparatireoidismo_primario__Netter_p170_PT.png': [
        ('troca', (414, 56, 642, 90), '(93% dos casos)', '(80–85%)', 'esq'),
        ('troca', (734, 56, 947, 90), '(6% dos casos)', '(10–15%)', 'esq'),
        ('troca', (1016, 56, 1229, 90), '(1% dos casos)', '(< 1%)', 'esq')],
    # Netter 6-5 (manifestações do HPTP): a NEM1 não tem componente tireoidiano (o CMT é da
    # NEM2); sai "tireoide" da lista de adenomas.
    'osteo/04_hiperparatireoidismo/patologia_e_manifestacoes_clinicas_do_hptp__Netter_p171_PT.png': [
        ('troca', (1180, 1855, 1445, 1890), 'tireoide, pâncreas,', 'pâncreas,', 'esq')],
    # Netter 6-6 (diagnóstico diferencial das hipercalcemias): na linha "Mieloma múltiplo e
    # linfoma", o 1,25(OH)2D "↓ ou N" vale para o mieloma; o linfoma produz calcitriol (cap.
    # 106). O rótulo fica "Mieloma múltiplo", centrado de novo na altura da linha.
    'osteo/06_hipercalcemia/diagnostico_diferencial_das_hipercalcemias__Netter_p172_PT.png': [
        ('troca', (222, 443, 362, 478), 'múltiplo e', 'múltiplo', 'esq'),
        ('limpa', (222, 477, 332, 505), (255, 255, 255)),
        ('move', (222, 412, 362, 479), 0, 16, (255, 255, 255))],
    # Netter 6-21 (raquitismo): "Peito de pombo (tórax em funil)" — peito de pombo é o tórax em
    # quilha (pectus carinatum); o tórax em funil é o oposto (pectus excavatum).
    'osteo/07_vitamina_d_raquitismo_osteomalacia/manifestacoes_clinicas_do_raquitismo_na_infancia__Netter_p187_PT.png': [
        ('troca', (115, 334, 330, 369), '(tórax em funil)', '(tórax em quilha)', 'dir')],
    # Netter 6-23 (Paget): a tradução tirou quatro rótulos e deixou as linhas de chamada
    # apontando para o vazio (orelha, tórax, flanco com dois ramos e perna); as linhas saem, e
    # o recorte perde o fio verde da moldura da prancha no topo.
    'osteo/08_doenca_de_paget_e_doencas_osseas_raras/doenca_de_paget_manifestacoes__Netter_p189_PT.png': [
        ('risco', (622, 245), (782, 170)), ('risco', (590, 408), (780, 312)),
        ('risco', (640, 540), (743, 633)), ('risco', (665, 630), (743, 633)), ('risco', (743, 633), (772, 652)),
        ('risco', (672, 942), (697, 1105)),
        ('corta', (0, 64, 1469, 2129))],
    # ---- Parte 2 de tireoide (seções 05 a 08, enviada em 20/10/2026) ----
    # Vilar 34.3 (curso da tireoidite subaguda): a 1ª fase é tireotoxicose por destruição, sem
    # hiperprodução (caps. 79 e 85), e o eixo em meses punha a fase tireotóxica em ~3,4 meses,
    # contra 2–8 semanas no cap. 85: saem os números, e "Meses" vira "Tempo".
    'tireoide/05_tireoidites/curso_trifasico_da_tireoidite_subaguda__Vilar_p580.png': [
        ('troca', (60, 12, 272, 50), 'Hipertireoidismo', 'Tireotoxicose', 'centro'),
        ('limpa', (0, 562, 960, 600)),
        ('troca', (430, 600, 535, 640), 'Meses', 'Tempo', 'centro'),
        ('move', (436, 600, 528, 640), 0, -22, (255, 255, 255))],
    # Netter 2-22 (tireoidite subaguda): o gráfico de febre em graus Fahrenheit perde os números
    # (os picos passam de 105 °F, ~41 °C) e fica "Temperatura"; sai a linha de chamada solta
    # abaixo de "Dor irradiada para o ouvido", resto da arte original.
    'tireoide/05_tireoidites/tireoidite_subaguda_de_quervain__Netter_p70_PT.png': [
        ('limpa', (722, 84, 786, 396)), ('limpa', (677, 158, 706, 362)), ('limpa', (664, 189, 674, 195)),
        ('move', (648, 160, 680, 362), 70, 0, None),
        ('risco', (729, 688), (695, 795))],
    # Williams 12.24 (síndromes do pós-parto): o fundo branco do rótulo "Tireoidite de Hashimoto
    # transitória" apagou um trecho da curva logo acima dele; o trecho é refeito.
    'tireoide/05_tireoidites/sindromes_tireoidianas_pos_parto__Williams_p488_PT.png': [
        ('traco', (605, 466.5), (630, 452.2), 5.5, (144, 64, 104), 150)],
    # Vilar 24.2 (radioiodo no CDT): o asterisco de "Tg elevada*" remete a uma nota que ficou fora
    # do recorte.
    'tireoide/07_cancer_de_tireoide/fluxograma_de_indicacao_de_radioiodoterapia_no_cdt__Vilar_p423.png': [
        ('limpa', (834, 244, 843, 253))],
    # Netter 2-25 (carcinoma medular): o fígado estava entre os "sítios menos comuns", mas o cap.
    # 84 o lista entre os sítios de metástase do CMT (linfonodal, óssea, pulmonar e hepática); e
    # "nódulos discretos" é falso cognato de "discrete nodules" (bem definidos).
    'tireoide/07_cancer_de_tireoide/carcinoma_medular_de_tireoide__Netter_p73_PT.png': [
        ('troca', (865, 1598, 1362, 1648), 'Sítios menos comuns de metástase', 'Fígado: comum; rim: raro', 'centro'),
        ('troca', (40, 1987, 312, 2028), '(nódulos discretos)', '(nódulos bem definidos)', 'centro')],
    # Vilar 25.2 (tireoidectomia profilática por risco do RET): o esvaziamento no portador do RET
    # é o do compartimento central, nível VI (o IV é jugular inferior, lateral); e "634,883" se lê
    # como número decimal: viram os códons C634 e A883F, como no cap. 84.
    'tireoide/07_cancer_de_tireoide/tireoidectomia_profilatica_conforme_mutacao_ret__Vilar_p439.png': [
        ('troca', (546, 120, 642, 148), '634,883', 'C634, A883F', 'centro'),
        # "IV" → "VI" trocando o I e o V de lugar (o redesenho saía mais escuro que o resto)
        ('permuta', (300, 324), (405, 425), [(410, 425, 405), (405, 410, 420)]),
        ('permuta', (324, 348), (653, 674), [(657, 673, 653), (653, 657, 669)])],
    # Williams 14.2 (níveis linfonodais): o limite entre os níveis III e IV é o plano da borda
    # INFERIOR da cartilagem cricóidea; e sai a letra "A", sem o "B" do painel de baixo.
    'tireoide/07_cancer_de_tireoide/compartimentos_e_niveis_linfonodais_do_pescoco__Williams_p538_PT.png': [
        ('limpa', (20, 858, 52, 892), (255, 255, 255)),
        ('troca', (948, 1336, 1200, 1365), 'Margem anterior da', 'Margem inferior da', 'esq')],
    # Greenspan 24-2 (paralisia periódica tireotóxica): sai "Fluxo noturno", sem sentido clínico
    # claro na tradução (o cap. 79 não o cita entre os precipitantes), e o bloco volta a ficar
    # centrado na seta; sai também o ponto solto antes do "K+".
    'tireoide/08_tireoide_gestacao_emergencias/patogenese_da_paralisia_periodica_tireotoxica__Greenspan_p812_PT.png': [
        ('limpa', (435, 403, 441, 409), (255, 255, 255)),
        ('limpa', (770, 430, 975, 466), (255, 255, 255)),
        ('move', (733, 355, 1012, 428), 0, 28, (255, 255, 255))],
    # Williams 14.6 (modelo molecular BRAF-like × RAS-like): as siglas ficam em inglês, como pediu
    # o professor (a legenda as explica); só saem os remendos da tradução. Na caixa "Carga
    # mutacional aumentada", um retângulo branco cobria o degradê e a borda esquerda, e o texto
    # saía da caixa: volta o degradê, a borda é refeita e o texto fica centrado. Atrás de
    # "PDCA, RAS-like", um retângulo liso destoava do degradê.
    'tireoide/07_cancer_de_tireoide/modelo_molecular_da_carcinogenese_tireoidiana_braf_ras__Williams_p552_PT.png': [
        ('refundo', (1155, 223, 1411, 298), 295, (1145, 226, 1356, 282), 32, 6),
        ('limpa', (1149, 223, 1155, 298), (72, 10, 5)),
        # o "C" começava fora da caixa: sobra dele à esquerda da borda
        ('limpa', (1140, 223, 1149, 293), (255, 255, 255)),
        ('refundo', (934, 1289, 1139, 1320), 1280, (934, 1289, 1139, 1320), 0, 0)],
    # Williams 22.1 (hCG, TSH e T4 livre na gestação): unidade em português (UI/L × 1.000),
    # vírgula decimal nos eixos e "TSH" sem o "h" (de human).
    'tireoide/08_tireoide_gestacao_emergencias/hcg_e_tsh_ao_longo_da_gestacao__Williams_p1000_PT.png': [
        ('troca', (76, 23, 129, 55), '1.5', '1,5', 'dir'), ('troca', (76, 189, 129, 221), '1.0', '1,0', 'dir'),
        ('troca', (76, 362, 129, 394), '0.5', '0,5', 'dir'), ('troca', (76, 741, 129, 773), '2.0', '2,0', 'dir'),
        ('troca', (76, 902, 129, 934), '1.5', '1,5', 'dir'), ('troca', (76, 1064, 129, 1096), '1.0', '1,0', 'dir'),
        ('troca', (370, 1262, 632, 1305), 'hCG (IU/L×1000)', 'hCG (UI/L × 1.000)', 'centro'),
        # o ajuste deste rótulo ficou mais fraco (o "×" do livro é de outra fonte) e o texto
        # novo saiu cinza: a rampa da `nitidez` devolve o preto do resto da figura
        ('nitidez', (360, 1262, 645, 1307), 0.12, 0.72),
        ('gira', (8, 135, 70, 445), [('troca', (10, 8, 208, 56), 'hTSH (mU/L)', 'TSH (mU/L)', 'dir')]),
        ('gira', (968, 80, 1032, 525), [('troca', (60, 4, 318, 54), 'hCG (IU/L×1000)', 'hCG (UI/L × 1.000)', 'dir'),
                                        ('nitidez', (12, 4, 322, 56), 0.12, 0.72)])],
}

def acha(rel):
    return os.path.join(ORIG, rel)

def aplica(im, ops, nome):
    for op in ops:
        if op[0] == 'limpa': limpa(im, op[1], op[2] if len(op) > 2 else None); print(nome, 'limpa', op[1])
        elif op[0] == 'copia': copia(im, op[1], op[2]); print(nome, 'copia', op[1], '→', op[2])
        elif op[0] == 'junta': print(nome, 'junta', junta(im, *op[1:]), 'px')
        elif op[0] == 'linhas': linhas(im, *op[1:]); print(nome, 'linhas', op[1])
        elif op[0] == 'move': move(im, *op[1:]); print(nome, 'move', op[1:4])
        elif op[0] == 'risco': print(nome, 'risco', risco(im, *op[1:]))
        elif op[0] == 'corta': im = im.crop(op[1]); print(nome, 'corta', op[1])
        elif op[0] == 'replica': replica(im, *op[1:]); print(nome, 'replica', op[1:])
        elif op[0] == 'contraste': print(nome, 'contraste', op[1], 'g =', contraste(im, *op[1:]))
        elif op[0] == 'nitidez': nitidez(im, *op[1:]); print(nome, 'nitidez', op[1])
        elif op[0] == 'desloca': desloca(im, *op[1:]); print(nome, 'desloca', op[1], op[2])
        elif op[0] == 'traco': print(nome, 'traco', op[1], op[2], traco(im, *op[1:]), 'px')
        elif op[0] == 'gira': gira(im, op[1], op[2], nome)
        elif op[0] == 'permuta': permuta(im, *op[1:]); print(nome, 'permuta', op[1:])
        elif op[0] == 'refundo': refundo(im, *op[1:]); print(nome, 'refundo', op[1])
        else:
            r = troca(im, *op[1:])
            print(nome, op[2], '→', op[3], '|', {k: v for k, v in r.items() if k in ('fonte', 'corpo', 'ajuste', 'tinta_rel', 'apaga')})
    return im

if __name__ == '__main__':
    so = sys.argv[3] if len(sys.argv) > 3 else ''
    for rel, ops in CORRECOES.items():
        if so not in rel: continue
        im = Image.open(acha(rel)).convert('RGB')
        im = aplica(im, ops, rel.split('/')[-1][:44])
        destino = os.path.join(SAIDA, rel)
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        im.save(destino, 'PNG', optimize=True)
