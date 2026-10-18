# Prepara os recortes para o armazenamento: copia o PNG como veio; com `aparaTopo`, tira só a
# faixa de cima acima do conteúdo da figura (o fio decorativo da página fica à direita, fora
# da figura); com formato 'jpg', grava em JPEG de qualidade 90 (prancha pintada pesada).
# Nada dentro da figura muda.
#   python prepara.py <pasta da extração> <pasta de saída> <lista.json: id, origem, formato, aparaTopo>
import json, os, sys
from PIL import Image
orig, saida, lista = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3], encoding='utf-8'))
os.makedirs(saida, exist_ok=True)
def topo_do_conteudo(im):
    # 1ª linha com pixel escuro nos 80% da esquerda (o fio decorativo fica no canto direito)
    g = im.convert('L'); w, h = g.size; px = g.load(); lim = int(w * 0.8)
    for y in range(h):
        if any(px[x, y] < 200 for x in range(0, lim, 2)): return y
    return 0
for f in lista:
    im = Image.open(os.path.join(orig, f['origem']))
    corte = 0
    if f.get('aparaTopo'):
        corte = max(0, topo_do_conteudo(im) - 12)
        im = im.crop((0, corte, im.size[0], im.size[1]))
    ext = f.get('formato') or 'png'
    destino = os.path.join(saida, f['id'] + '.' + ext)
    if ext == 'jpg': im.convert('RGB').save(destino, 'JPEG', quality=90, optimize=True, progressive=True)
    elif corte: im.save(destino, 'PNG', optimize=True)
    else:
        with open(os.path.join(orig, f['origem']), 'rb') as a, open(destino, 'wb') as b: b.write(a.read())
    print(f['id'], im.size, os.path.getsize(destino) // 1024, 'KB', ('aparado ' + str(corte) + ' px no topo') if corte else '')
