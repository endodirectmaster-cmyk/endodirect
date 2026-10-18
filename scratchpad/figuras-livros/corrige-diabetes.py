# Corrige rótulos errados nas figuras de diabetes (lote enviado em 18/10/2026), antes de
# publicar. Só onde o erro muda o sentido ou é erro de grafia evidente; formas estranhas
# mas corretas do livro ficam como estão. Coordenadas em pixels da imagem do zip
# imagens_diabetes_PT.
#   - copia: reaproveita um glifo da própria figura (a seta ↓ do rótulo vizinho);
#   - troca: procura a Liberation Sans (normal ou negrito), o corpo, a espessura, o desfoque
#     e a posição (em 1/4 de pixel) que reproduzem a palavra errada pixel a pixel; apaga a
#     palavra e escreve a certa com os mesmos parâmetros, na mesma linha de base. Com
#     `arrasta`, o resto da linha anda meia diferença de largura, para a linha continuar
#     centrada;
#   - limpa: cobre uma região com a cor do fundo.
#   python corrige-diabetes.py <pasta imagens_diabetes_PT> <pasta de saída>
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

CORRECOES = {
    # Matfin 31-3 (HAAF): a tradução pôs "↑ Respostas neurais simpáticas"; no original e no
    # mecanismo é ↓. A seta ↓ do rótulo vizinho ("↓Respostas da epinefrina") é copiada.
    '08_hipoglicemia/falencia_autonomica_associada_a_hipoglicemia_haaf__Matfin_p530_PT.png': [
        ('limpa', (962, 754, 989, 786)), ('copia', (573, 755, 595, 785), (964, 755))],
    # Vilar 69.5: o ramo sensitivo leva à perda da sensibilidade PROTETORA (conceito do
    # rastreamento do pé); "sensibilidade motora" não existe.
    '06_complicacoes_cronicas/mecanismos_de_ulceracao_no_pe_diabetico__Vilar_p1256.png': [
        ('troca', (282, 279, 350, 302), 'motora', 'protetora', 'centro')],
    # Vilar 70.5: o órgão do meio (gliconeogênese renal) é o rim, rotulado "Fígado" no livro.
    '08_hipoglicemia/defesas_fisiologicas_contra_a_hipoglicemia__Vilar_p1289.png': [
        ('troca', (592, 802, 676, 832), 'Fígado', 'Rim', 'centro')],
    # Vilar 70.1: "contrarregulares" → contrarreguladores; "↓ Função normal" → renal (a
    # desidratação reduz a função renal). O resto de cada linha anda para ela seguir centrada.
    '07_emergencias_hiperglicemicas/patogenese_da_cad_e_do_ehh__Vilar_p1277.png': [
        ('troca', (528, 29, 694, 61), 'contrarregulares', 'contrarreguladores', 'esq', (400, 29, 528, 61)),
        ('troca', (969, 762, 1050, 792), 'normal', 'renal', 'esq', (868, 762, 969, 792))],
    # Vilar 68.2: "neutróficos" → neurotróficos.
    '06_complicacoes_cronicas/mecanismos_da_neuropatia_diabetica__Vilar_p1222.png': [
        ('troca', (722, 700, 827, 725), 'neutróficos', 'neurotróficos', 'centro')],
    # Vilar 59.2: "neutrotransmissores" → neurotransmissores.
    '03_farmacologia_antidiabeticos/defeitos_do_dm2_e_medicamentos_dirigidos__Vilar_p1066.png': [
        ('troca', (672, 871, 904, 896), 'neutrotransmissores', 'neurotransmissores', 'centro')],
    # Vilar 63.5: "atuomatizado" → automatizado (texto alinhado à esquerda).
    '05_tecnologia/etapas_do_pancreas_artificial__Vilar_p1139.png': [
        ('troca', (912, 441, 1066, 463), 'atuomatizado com', 'automatizado com', 'esq')],
    # Williams 36.8 (CGM): "Glicose" e "Sensor de glicose" estavam trocados (a linha de "Glicose"
    # ia ao filamento do sensor; a de "Sensor de glicose", a uma molécula de glicose). As palavras
    # trocam de lugar e as linhas ficam: "Sensor de / glicose" sobe para a linha do filamento e
    # "Glicose" desce para a da molécula. A hora "10:53 AM" das telas vira "10:53".
    '05_tecnologia/componentes_do_sistema_de_cgm__Williams_p1785_PT.png': [
        ('reordena', 20, 197, 25, 9, [(469, 427), (506, 464), (427, 506)]),
        ('troca', (1155, 75, 1246, 97), '10:53 AM', '10:53', 'centro'),
        ('troca', (1150, 395, 1250, 421), '10:53 AM', '10:53', 'centro')],
    # Vilar 63.4 (metas do CGM): na coluna do DM1/DM2, o limite do tempo abaixo do alvo saiu
    # "< 63 mg/dℓ"; o certo é < 70 mg/dL (63 só vale na gestação). O rótulo "< 70 mg/dℓ" da
    # coluna vizinha, igual em fonte e posição em relação à barra, é copiado por cima.
    '05_tecnologia/metas_de_tempo_no_alvo_tir__Vilar_p1136.png': [
        ('copia', (322, 383, 411, 401), (44, 375))],
    # Vilar 59.9: caixa solta e repetida "Aumento do GLP-1 e GIP", sem setas.
    '03_farmacologia_antidiabeticos/mecanismo_de_acao_dos_inibidores_da_dpp4__Vilar_p1075.png': [
        ('limpa', (812, 130, 1058, 238), (255, 255, 255))],
}

for rel, ops in CORRECOES.items():
    im = Image.open(os.path.join(ORIG, rel)).convert('RGB')
    for op in ops:
        if op[0] == 'limpa': limpa(im, op[1], op[2] if len(op) > 2 else None); print(rel.split('/')[-1][:40], 'limpa', op[1])
        elif op[0] == 'copia': copia(im, op[1], op[2]); print(rel.split('/')[-1][:40], 'copia', op[1], '→', op[2])
        elif op[0] == 'reordena': reordena(im, *op[1:]); print(rel.split('/')[-1][:40], 'reordena', op[5])
        else:
            r = troca(im, *op[1:])
            print(rel.split('/')[-1][:40], op[2], '→', op[3], '|', r)
    destino = os.path.join(SAIDA, rel)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    im.save(destino, 'PNG', optimize=True)
