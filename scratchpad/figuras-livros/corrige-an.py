# Corrige as figuras de adrenal, neuroendocrinologia e lípides (zips do bucket livros enviados
# pelo professor em 24/10/2026) antes de publicar. Usa a maquinaria do corrige-tob.py (troca,
# limpa, copia, junta, linhas, nitidez, traco, permuta, corta…) e acrescenta:
#   - troca_caixas: troca de lugar duas caixas do mesmo tamanho (como no corrige-eb2.py);
#   - girahor: gira a imagem inteira 90° no sentido horário; as operações seguintes usam as
#     coordenadas da imagem girada;
#   - inverte: inverte as cores da imagem inteira (exame de imagem que saiu do PDF em negativo,
#     com osso preto e gordura branca).
# Nesta rodada não há recorte original em inglês para comparar: a tradução foi julgada pela
# própria imagem. As correções de cada figura ficam em correcoes-an/*.json, uma lista de
# operações por figura, com a chave igual à `origem` da lista (área/pasta/arquivo, por exemplo
# "Adrenal/02_sindrome_de_cushing/<arquivo>_PT.png"), para os conferentes trabalharem em
# paralelo sem mexer neste script.
#   python3 corrige-an.py <pasta extraido> <pasta de saída> [filtro]
# <pasta extraido> tem uma subpasta por zip: <Área>_imagens_…_parteN/<pasta>/<arquivo>.
import glob, json, os, sys
from PIL import Image, ImageOps
EXT, SAIDA = sys.argv[1:3]
SO = sys.argv[3] if len(sys.argv) > 3 else ''
# o corrige-tob.py lê a pasta de origem e a de saída ao ser importado
sys.argv = [sys.argv[0], EXT, SAIDA]
import importlib.util
_spec = importlib.util.spec_from_file_location('ctob', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'corrige-tob.py'))
ctob = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(ctob)

def tupla(x):
    return tuple(tupla(v) for v in x) if isinstance(x, list) else x

def arquivo(origem):
    # "Adrenal/02_…/x.png" → <EXT>/Adrenal_imagens_adrenal_PT_parte1/02_…/x.png
    area, resto = origem.split('/', 1)
    achados = glob.glob(os.path.join(EXT, area + '_*', resto))
    assert len(achados) == 1, (origem, achados)
    return achados[0]

def troca_caixas(im, a, b):
    pa, pb = im.crop(a), im.crop(b)
    assert pa.size == pb.size, (a, b)
    im.paste(pb, a[:2]); im.paste(pa, b[:2])

def aplica(im, ops, nome):
    for op in ops:
        op = tupla(op)
        if op[0] == 'troca_caixas': troca_caixas(im, op[1], op[2]); print(nome, 'troca_caixas', op[1], op[2])
        elif op[0] == 'girahor': im = im.transpose(Image.ROTATE_270); print(nome, 'girada 90° (horário)', im.size)
        elif op[0] == 'inverte': im = ImageOps.invert(im); print(nome, 'invertida')
        else: im = ctob.aplica(im, [op], nome)
    return im

if __name__ == '__main__':
    pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'correcoes-an')
    for arq in sorted(glob.glob(os.path.join(pasta, '*.json'))):
        for origem, ops in json.load(open(arq, encoding='utf-8')).items():
            if SO not in origem: continue
            im = Image.open(arquivo(origem)).convert('RGB')
            im = aplica(im, ops, origem.split('/')[-1][:44])
            destino = os.path.join(SAIDA, origem)
            os.makedirs(os.path.dirname(destino), exist_ok=True)
            im.save(destino, 'PNG', optimize=True)
