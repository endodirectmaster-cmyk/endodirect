# Helper: extrai citações LITERAIS do texto gravado, por busca normalizada.
# Espelha exatamente a normalização do verificador (scripts/verifica-extracao.js).
import re, json, sys

def _norm_map(raw):
    """Retorna (normalizado, mapa normIdx->rawIdx)."""
    out = []
    idx = []
    prev_space = False
    for i, ch in enumerate(raw):
        c = ch
        if c in "‘’ʼ":
            c = "'"
        elif c in "“”":
            c = '"'
        elif ("‐" <= c <= "―") or c == "−":
            c = "-"
        elif c == " ":
            c = " "
        if c.isspace():
            if prev_space:
                continue
            out.append(" ")
            idx.append(i)
            prev_space = True
        else:
            out.append(c.lower())
            idx.append(i)
            prev_space = False
    return "".join(out), idx

def _norm_needle(s):
    n, _ = _norm_map(s)
    return n.strip()

def _dehyphen(norm, idx):
    """Remove '- ' (hifen de quebra de linha do PDF), como faz o verificador."""
    out, oidx = [], []
    i = 0
    while i < len(norm):
        if norm[i] == "-" and i + 1 < len(norm) and norm[i + 1] == " ":
            i += 2
            continue
        out.append(norm[i])
        oidx.append(idx[i])
        i += 1
    return "".join(out), oidx

class Fonte:
    """Busca sempre na versao normalizada E sem hifen de quebra (norm2),
    depois mapeia de volta para o texto cru — a citacao devolvida e' literal."""
    def __init__(self, path):
        self.raw = open(path, encoding="utf-8").read()
        self.norm, self.map = _norm_map(self.raw)
        self.norm2, self.map2 = _dehyphen(self.norm, self.map)

    def q(self, start, end=None):
        s = _norm_needle(start).replace("- ", "")
        i = self.norm2.find(s)
        if i < 0:
            raise LookupError("NEEDLE: " + repr(start[:90]))
        if self.norm2.find(s, i + 1) >= 0:
            print("  [aviso] needle ambiguo (>1 ocorrencia): " + repr(start[:60]))
        j = i + len(s)
        if end is not None:
            e = _norm_needle(end).replace("- ", "")
            k = self.norm2.find(e, i)
            if k < 0:
                raise LookupError("END: " + repr(end[:90]) + " apos " + repr(start[:45]))
            j = k + len(e)
        trecho = self.raw[self.map2[i]:self.map2[j - 1] + 1]
        return re.sub(r"\s+", " ", trecho).strip()

# --- checagem local das mesmas regras do verificador ---
def numeros(s):
    br = re.findall(r"\d+(?:[.,]\d+)?", s or "")
    ok = []
    for n in br:
        if re.fullmatch(r"(19|20)\d{2}", n):
            continue
        if len(n) == 1 and int(n) <= 4:
            continue
        ok.append(n)
    return ok

def num_ok(n, hay):
    return (n.replace(",", ".") in hay) or (n.replace(".", ",") in hay) or (n in hay)

def checa(extrato, fonte):
    probs = []
    for i, f in enumerate(extrato["fatos"], 1):
        cit = f["citacao"]
        if len(cit.strip()) < 25:
            probs.append(f"#{i} citacao curta ({len(cit.strip())})")
        if _norm_needle(cit) not in fonte.norm:
            probs.append(f"#{i} NAO ENCONTRADA: {cit[:70]}")
        falt = [n for n in numeros(f["afirmacao"]) if not num_ok(n, cit)]
        if falt:
            probs.append(f"#{i} numeros sem respaldo: {falt} :: {f['afirmacao'][:90]}")
    return probs

def grava(extrato, fonte, out):
    probs = checa(extrato, fonte)
    if probs:
        print("PROBLEMAS (%d):" % len(probs))
        for p in probs:
            print("  -", p)
        sys.exit(1)
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(extrato, fh, ensure_ascii=False, indent=1)
    print("OK -> %s (%d fatos)" % (out, len(extrato["fatos"])))
