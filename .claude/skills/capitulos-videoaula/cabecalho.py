# Cabeçalho de um quadro lido pelo tesseract: as duas primeiras linhas com texto de verdade.
# Nos slides do Endodirect a 1ª é o sobretítulo (seção ou nome da aula) e a 2ª o título do
# slide. Linhas com menos de 4 letras ("E)", "B", "|") são o logotipo ou ruído e ficam fora.
import re
from difflib import SequenceMatcher


def linhas(txt):
    return [l.strip() for l in txt.split('\n') if len(re.sub(r'[^A-Za-zÀ-ÿ]', '', l)) >= 4]


def cabecalho(txt):
    return ' | '.join(linhas(txt)[:2])[:120]


def chave(cab):
    return re.sub(r'[^a-zà-ÿ0-9]', '', cab.lower())


def parecido(a, b, corte=0.8):
    return SequenceMatcher(None, chave(a), chave(b)).ratio() >= corte
