# Corrige defeitos de acabamento das figuras traduzidas do lote 1 (18/10/2026).
# A tradução trocou os rótulos pintando caixas por cima da arte, e em cinco figuras a caixa
# apagou pedaços do desenho (seta, borda, arcos, pontinhos). Aqui a arte volta a partir do
# original em inglês, só nos pontos medidos, sem trazer de volta texto em inglês. O texto
# traduzido não muda. Coordenadas em pixels da imagem extraída (a mesma nos dois idiomas).
#   python corrige.py <extração original> <extração traduzida> <pasta de saída>
import os, sys
import numpy as np
from PIL import Image

ORIG, PT, SAIDA = sys.argv[1:4]

def carrega(rel):
    o = np.asarray(Image.open(os.path.join(ORIG, rel + '.png')).convert('RGB')).astype(np.int32)
    p = np.asarray(Image.open(os.path.join(PT, rel + '_PT.png')).convert('RGB')).astype(np.int32)
    assert o.shape == p.shape, rel
    return o, p

def grava(rel, a):
    destino = os.path.join(SAIDA, rel + '_PT.png')
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(destino, 'PNG', optimize=True)
    print('corrigida', rel)

def lum(a): return a.mean(axis=2)
def neutro(a, lim): return (a.max(axis=2) - a.min(axis=2)) < lim

def dilata(m, r):
    H, W = m.shape; pad = np.pad(m, r); out = np.zeros_like(m)
    for dy in range(2 * r + 1):
        for dx in range(2 * r + 1): out |= pad[dy:dy + H, dx:dx + W]
    return out

def faixa(n, o, y0, y1, centro, meia=4):
    # traz de volta, pelo mais escuro dos dois, a faixa ao longo de uma seta reta
    for y in range(y0, y1):
        xc = centro(y); x0 = int(np.floor(xc - meia)); x1 = int(np.ceil(xc + meia)) + 1
        n[y, x0:x1] = np.minimum(n[y, x0:x1], o[y, x0:x1])

def harmonico(img, mascara, voltas=1500):
    # preenche a máscara pela média dos vizinhos até estabilizar (traços finos de letra)
    out = img.astype(float).copy(); ys, xs = np.nonzero(mascara)
    caixa = (slice(ys.min() - 1, ys.max() + 2), slice(xs.min() - 1, xs.max() + 2))
    out[ys, xs] = img[caixa][~mascara[caixa]].mean(axis=0)
    for _ in range(voltas):
        out[ys, xs] = (out[ys - 1, xs] + out[ys + 1, xs] + out[ys, xs - 1] + out[ys, xs + 1]) / 4
    return out

def williams_34_4():
    # Receptor de insulina: a caixa de "Síntese de lipídeos" apagou a seta que sai do aPKC.
    # "Síntese" recua 4 px e a seta original volta, 4 px à direita, até a borda da caixa.
    rel = '06_pancreas_endocrino/sinalizacao_do_receptor_de_insulina__Williams_p1691'
    o, p = carrega(rel); n = p.copy()
    n[749:770, 44:123] = p[749:770, 48:127]
    n[749:770, 123:127] = p[749:770, 127:131]
    n[749:772, 127:156] = o[749:772, 123:152]
    grava(rel, n)

def molina_1_6():
    # Quinases e JAK-STAT.
    rel = '02_mecanismos_acao_hormonal/receptores_tirosina_cinase_e_citocinas_jak_stat__Molina_p28'
    o, p = carrega(rel); n = p.copy()
    # caixa "Insulina IGFs": bordas de cima, da esquerda e da direita
    n[30:36, 44:115] = o[30:36, 44:115]
    n[30:69, 105:115] = o[30:69, 105:115]
    n[30:69, 44:49] = o[30:69, 44:49]
    # "Proteínas IRS": os dois conectores da borda de baixo
    n[229:237, 168:182] = o[229:237, 168:182]
    n[229:237, 225:241] = o[229:237, 225:241]
    # "Translocação": o traço da seta que a caixa do rótulo cortou
    n[158:163, 450:463] = o[158:163, 450:463]
    # glicose → glicose-6-fosfato: a ponta da seta borrada e o começo do traço de baixo
    assert (lum(p[246:257, 490:512])[:, np.r_[0:8, 12:22]] > 150).all()
    n[211:218, 490:512] = o[211:218, 490:512]
    n[249:257, 494:506] = o[249:257, 494:506]
    # "Mitogênese" e "Síntese proteica" quase colados: "Síntese proteica" vai 6 px à direita
    # e fica centrada na própria seta, como no original
    fundo = p[320:358, 156:166].mean(axis=1, keepdims=True).astype(np.int32)
    n[320:358, 107:160] = p[320:358, 101:154]
    n[320:358, 101:107] = fundo
    # "Transcrição": a caixa branca cobriu o núcleo azul e deixou um borrão à direita. O fundo
    # volta do original, com as letras em inglês preenchidas pelos vizinhos, e o texto em
    # português entra por cima, com a transparência tirada do branco da caixa.
    y0, y1, x0, x1 = 756, 773, 235, 322
    mascara = np.zeros(o.shape[:2], bool)
    sub = o[757:772, 239:316]
    mascara[757:772, 239:316] = (neutro(sub, 25) & (lum(sub) < 200)) | (lum(sub) < 150)
    mascara = dilata(mascara, 1)
    # o "n" de "Transcription" encostava na borda do núcleo, e o preenchimento puxaria o
    # branco de fora. A borda é refeita pela curva medida nas linhas acima e abaixo das
    # letras (onde o vermelho cruza 182) e pelo perfil de cor que ela tem nessas linhas.
    ys, xs = [], []
    for y in list(range(748, 757)) + list(range(773, 779)):
        r = o[y, 300:322, 0]
        k = max(k for k in range(21) if r[k] < 182 <= r[k + 1])
        ys.append(y); xs.append(300 + k + (182 - r[k]) / (r[k + 1] - r[k]))
    borda = np.poly1d(np.polyfit(ys, xs, 2))
    dist = np.array([x - borda(y) for y in ys for x in range(300, 322)])
    cor = np.array([o[y, x] for y in ys for x in range(300, 322)], float)
    fundo = o.astype(float)
    for y in range(757, 772):
        for x in range(300, 322):
            d = x - borda(y)
            if d >= -2.5:
                perto = np.abs(dist - d) < 0.35
                fundo[y, x] = cor[perto].mean(axis=0) if perto.any() else cor[np.abs(dist - d).argmin()]
                mascara[y, x] = False
    fundo = harmonico(fundo, mascara)
    caixa = p[y0:y1, x0:308]; Lc = lum(caixa)
    letra = neutro(caixa, 25) & (Lc < 245)
    tinta = caixa[letra][caixa[letra].mean(axis=1).argmin()].astype(float)
    alfa = np.where(letra, (255 - Lc) / (255 - tinta.mean()), 0).clip(0, 1)[..., None]
    n[y0:y1, x0:308] = np.rint(fundo[y0:y1, x0:308] * (1 - alfa) + tinta * alfa).astype(np.int32)
    n[y0:y1, 308:x1] = np.rint(fundo[y0:y1, 308:x1]).astype(np.int32)
    grava(rel, n)

def greenspan_7_7():
    # Tireoglobulina: a caixa de "Síntese proteica" apagou a cisterna do retículo à esquerda;
    # em volta de "Síntese de enzimas lisossômicas" ficaram borrões claros sobre o desenho;
    # sob "lisossômicas" (o rótulo de cima) sobrou a perna do "y" de "enzymes".
    rel = '04_tireoide/sintese_iodacao_e_reabsorcao_da_tireoglobulina__Greenspan_p200'
    o, p = carrega(rel); n = p.copy()
    def restaura(y0, y1, x0, x1, folga):
        # onde a tradução mudou o pixel longe (folga) do texto novo: o desenho original volta
        # e o que era letra em inglês fica branco. Texto novo é só o miolo preto das letras;
        # o cinza claro em volta é o borrão deixado pela caixa.
        oo, pp = o[y0:y1, x0:x1], p[y0:y1, x0:x1]
        mudou = np.abs(oo - pp).max(axis=2) > 24
        perto = dilata(mudou & neutro(pp, 40) & (lum(pp) < 110), folga + 1)
        alvo = mudou & ~perto; ingles = neutro(oo, 40) & (lum(oo) < 240)
        bloco = n[y0:y1, x0:x1]
        bloco[alvo & ingles] = 255
        bloco[alvo & ~ingles] = oo[alvo & ~ingles]
    restaura(668, 748, 128, 163, 2)
    restaura(680, 792, 1000, 1176, 3)
    ys, xs = np.nonzero(lum(p[390:408, 740:800]) <= 235)
    assert set(ys + 390) == {398} and xs.min() + 740 >= 760 and xs.max() + 740 < 772
    n[396:401, 760:772] = 255
    grava(rel, n)

def greenspan_7_14():
    # Desiodação: as caixas de "Ativação" e "Inativação" encurtaram as duas setas de cima.
    rel = '04_tireoide/vias_de_desiodacao_da_tiroxina__Greenspan_p206'
    o, p = carrega(rel); n = p.copy()
    faixa(n, o, 160, 190, lambda y: 650 - (y - 164))
    faixa(n, o, 158, 187, lambda y: 888 + (y - 146))
    grava(rel, n)

def greenspan_1_17():
    # Receptor de esteroide: a legenda de baixo, mais longa em português, cortou a base dos
    # dois arcos. A legenda desce 12 px e a base dos arcos volta do original.
    rel = '02_mecanismos_acao_hormonal/mecanismo_do_receptor_nuclear_de_esteroide__Greenspan_p45'
    o, p = carrega(rel); n = p.copy()
    usadas = np.where((lum(p[1218:]) < 245).any(axis=0))[0]
    assert usadas.min() >= 20 and usadas.max() <= 480 and (lum(p[1298:]) > 250).all()
    assert not (neutro(o[1205:1229], 40) & (lum(o[1205:1229]) < 200)).any()
    legenda = p[1218:1298].copy()
    legenda[~neutro(legenda, 40)] = 255          # restos rosados das pontas cortadas dos arcos
    n[1230:1310] = legenda
    n[1218:1230] = 255
    n[1205:1229] = np.minimum(n[1205:1229], o[1205:1229])
    grava(rel, n)

for corrige in (williams_34_4, molina_1_6, greenspan_7_7, greenspan_7_14, greenspan_1_17):
    corrige()
