# "m:ss  NNNs  sobretítulo | título" a cada troca de slide lida por slides.sh. Quadros de
# transição (dois slides sobrepostos, texto embaralhado) aparecem como uma linha a mais com o
# mesmo minuto: o capítulo começa no primeiro deles.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cabecalho import cabecalho, parecido  # noqa: E402

d = sys.argv[1]
ts = [float(x) for x in open(os.path.join(d, 'tempos.txt')).read().split()]
ult = None
for i, t in enumerate(ts, 1):
    f = os.path.join(d, 's_%03d.jpg.txt' % i)
    if not os.path.exists(f):
        continue
    cab = cabecalho(open(f, encoding='utf8').read())
    if not cab or (ult and parecido(cab, ult, 0.9)):
        continue
    ult = cab
    print('%d:%02d %4ds  %s' % (int(t // 60), int(t % 60), int(t), cab))
