# Corrige as figuras do 2º lote dos livros (fisiologia de cada glândula, zip de Endocrinologia
# Básica, 23/10/2026) antes de publicar. Usa a maquinaria do corrige-tob.py (troca, limpa,
# copia, junta, nitidez, traco, permuta…) e acrescenta três operações:
#   - troca_caixas: troca de lugar duas caixas do mesmo tamanho (os rótulos "Via Δ4"/"Via Δ5"
#     da Williams 19.8, trocados no próprio livro: basta trocar os algarismos);
#   - girahor: gira a imagem inteira 90° no sentido horário (prancha que veio deitada); as
#     operações seguintes usam as coordenadas da imagem girada;
#   - restaura: traz de volta a arte do recorte original em inglês, nas mesmas coordenadas, só
#     onde a tradução apagou o desenho com um remendo claro (nunca onde o original tem texto).
# As correções de cada figura ficam em correcoes-eb2/*.json (uma lista de operações por
# arquivo do zip), para os conferentes trabalharem em paralelo sem mexer neste script.
#   python3 corrige-eb2.py <pasta extraido-pt> <pasta extraido (inglês)> <pasta de saída> [filtro]
import glob, json, os, sys
import numpy as np
from PIL import Image
sys.argv = [sys.argv[0], sys.argv[1], sys.argv[3]] + sys.argv[4:] + ['__en__=' + sys.argv[2]] if len(sys.argv) > 3 else sys.argv
EN = [a for a in sys.argv if a.startswith('__en__=')]
EN = EN[0][7:] if EN else None
sys.argv = [a for a in sys.argv if not a.startswith('__en__=')]
import importlib.util
_spec = importlib.util.spec_from_file_location('ctob', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'corrige-tob.py'))
ctob = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(ctob)
ORIG, SAIDA = sys.argv[1:3]

def tupla(x):
    return tuple(tupla(v) for v in x) if isinstance(x, list) else x

def troca_caixas(im, a, b):
    pa, pb = im.crop(a), im.crop(b)
    assert pa.size == pb.size, (a, b)
    im.paste(pb, a[:2]); im.paste(pa, b[:2])

def restaura(im, en, caixa, limiar=200):
    # pixel a pixel: onde a tradução está clara (remendo) e o original tem desenho, vale o original
    x0, y0, x1, y1 = caixa
    p = np.asarray(im.crop(caixa)).astype(int); o = np.asarray(en.crop(caixa)).astype(int)
    claro = p.mean(axis=2) >= limiar
    novo = np.where(claro[..., None], o, p)
    im.paste(Image.fromarray(novo.astype(np.uint8)), (x0, y0))
    return int(claro.sum())

def aplica(im, en, ops, nome):
    for op in ops:
        op = tupla(op)
        if op[0] == 'troca_caixas': troca_caixas(im, op[1], op[2]); print(nome, 'troca_caixas', op[1], op[2])
        elif op[0] == 'girahor':
            im = im.transpose(Image.ROTATE_270)
            if en is not None: en = en.transpose(Image.ROTATE_270)
            print(nome, 'girada 90° (horário)', im.size)
        elif op[0] == 'restaura': print(nome, 'restaura', op[1], restaura(im, en, *op[1:]), 'px')
        else: im = ctob.aplica(im, [op], nome)
    return im

if __name__ == '__main__':
    so = sys.argv[3] if len(sys.argv) > 3 else ''
    pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'correcoes-eb2')
    for arq in sorted(glob.glob(os.path.join(pasta, '*.json'))):
        for rel, ops in json.load(open(arq, encoding='utf-8')).items():
            if so not in rel: continue
            im = Image.open(os.path.join(ORIG, rel)).convert('RGB')
            en = None
            if EN:
                cand = os.path.join(EN, rel.replace('_PT.png', '.png'))
                if os.path.exists(cand): en = Image.open(cand).convert('RGB')
            im = aplica(im, en, ops, rel.split('/')[-1][:44])
            destino = os.path.join(SAIDA, rel)
            os.makedirs(os.path.dirname(destino), exist_ok=True)
            im.save(destino, 'PNG', optimize=True)
