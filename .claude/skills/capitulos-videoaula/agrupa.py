# Agrupa os quadros lidos por slides.sh em slides (mesmo cabeçalho = o mesmo slide sendo
# construído) e imprime o texto do ÚLTIMO quadro de cada um, que é o slide completo.
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cabecalho import cabecalho, parecido  # noqa: E402

d = sys.argv[1]
ts = [float(x) for x in open(os.path.join(d, 'tempos.txt')).read().split()]
grupos = []
for i, t in enumerate(ts, 1):
    f = os.path.join(d, 's_%03d.jpg.txt' % i)
    if not os.path.exists(f):
        continue
    txt = open(f, encoding='utf8').read()
    cab = cabecalho(txt)
    if not cab:
        continue
    if grupos and parecido(cab, grupos[-1]['cab']):
        grupos[-1]['fim'] = (i, t, txt)
        grupos[-1]['cab'] = cab
    else:
        grupos.append({'cab': cab, 'ini': t, 'fim': (i, t, txt)})
for g in grupos:
    i, t, txt = g['fim']
    print('=== %d:%02d (quadro %d)' % (int(g['ini'] // 60), int(g['ini'] % 60), i))
    print(re.sub(r'\n\s*\n+', '\n', txt).strip())
