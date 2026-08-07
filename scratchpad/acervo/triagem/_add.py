import json,sys,os
BASE="/home/user/endodirect/scratchpad/acervo"
JL=os.path.join(BASE,"triagem","_L2.jsonl")
OUT=os.path.join(BASE,"triagem","L2.json")
lote={d["id"]:d for d in json.load(open(os.path.join(BASE,"lotes","L2.json")))}
recs=json.load(sys.stdin)
with open(JL,"a") as f:
    for r in recs:
        b=lote[r["id"]]
        full={"id":r["id"],"titulo":b["titulo"],"area":b["area"],"caminho":b["caminho"],
              "tipo":r["tipo"],"titulo_real":r["titulo_real"],"periodico":r["periodico"],
              "ano":r["ano"],"sociedade":r["sociedade"],"tema":r["tema"],
              "valor_ancoragem":r["valor_ancoragem"],"observacao":r.get("observacao","")}
        f.write(json.dumps(full,ensure_ascii=False)+"\n")
seen={}
order=[]
for line in open(JL):
    o=json.loads(line)
    if o["id"] not in seen: order.append(o["id"])
    seen[o["id"]]=o
final=[seen[i] for i in order]
json.dump(final,open(OUT,"w"),ensure_ascii=False,indent=1)
print("gravados:",len(final))
