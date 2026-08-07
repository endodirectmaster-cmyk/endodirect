#!/usr/bin/env python3
# Espelha a normalizacao de scripts/verifica-extracao.js para eu conferir
# citacoes ANTES de gravar o extrato.
import re, sys, json, unicodedata

def norm(s):
    s = str(s or '')
    s = re.sub(r'[‘’ʼ]', "'", s)
    s = re.sub(r'[“”]', '"', s)
    s = re.sub(r'[‐-―−]', '-', s)
    s = s.replace(' ', ' ')
    s = re.sub(r'\s+', ' ', s)
    return s.lower().strip()

def sem_hifen(s):
    return re.sub(r'-\s+', '', str(s or ''))

def numeros(s):
    bruto = re.findall(r'\d+(?:[.,]\d+)?', str(s or ''))
    out = []
    for n in bruto:
        if re.fullmatch(r'(19|20)\d{2}', n):
            continue
        if len(n) == 1 and int(n) <= 4:
            continue
        out.append(n)
    return out

def num_presente(n, hay):
    return (n.replace(',', '.') in hay) or (n.replace('.', ',') in hay) or (n in hay)

def checa(txt_path, fatos):
    fonte = norm(open(txt_path, encoding='utf-8').read())
    fonte_sh = sem_hifen(fonte)
    bad = 0
    for i, f in enumerate(fatos, 1):
        cit = str(f.get('citacao', ''))
        afi = str(f.get('afirmacao', ''))
        if len(cit.strip()) < 25:
            print(f'#{i} CURTA ({len(cit.strip())}): {cit[:60]}'); bad += 1; continue
        c = norm(cit)
        if c not in fonte and sem_hifen(c) not in fonte_sh:
            print(f'#{i} NAO ENCONTRADA: {cit[:100]}'); bad += 1; continue
        falta = [n for n in numeros(afi) if not num_presente(n, c)]
        if falta:
            print(f'#{i} NUMERO SEM RESPALDO {falta}: {afi[:90]}'); bad += 1
    print(f'--- {len(fatos)} fatos, {bad} problema(s)')
    return bad

if __name__ == '__main__':
    ext = json.load(open(sys.argv[1], encoding='utf-8'))
    sys.exit(1 if checa(sys.argv[2], ext['fatos']) else 0)
