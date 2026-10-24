import json
import re

def load(path):
    raw = {}
    with open(path, "r", encoding = "utf-8") as f:
        for line in f:
            if not line.strip(): continue
            parts = re.split(r'\t+|\s{2,}', line.strip())
            if len(parts) >= 4:
                query = parts[1].strip()
                ans = parts[3].strip()
                
                if query not in raw:
                    raw[query] = []
                if ans not in raw[query]:
                    raw[query].append(ans)
    return raw

def build(raw, separator = ", "):
    formatted = []
    for query, answers in raw.items():
        a = list(dict.fromkeys([str(ans).strip() for ans in answers]))
        
        formatted.append({
            "q": query,
            "a": a,
            "t": separator.join(a)
        })
    return formatted

def invert(formatted, separator = ", "):
    m = {}
    
    for entry in formatted:
        orgQ = entry["q"]
        origA = entry["a"]
        
        for q in origA:
            if q not in m:
                m[q] = []
            
            if orgQ not in m[q]:
                m[q].append(orgQ)
                
    inverted = []
    for q, a in m.items():
        inverted.append({
            "q": q,
            "a": a,
            "t": q
        })
        
    return inverted

rawData = load("ii0.tsv")
    
forward = build(rawData, separator = " | ")
backward = invert(forward, separator = " | ")

with open("ii1.json", "w", encoding = "utf-8") as f:
    json.dump(forward, f, indent = 2, ensure_ascii = False)
        
with open("ii2.json", "w", encoding = "utf-8") as f:
    json.dump(backward, f, indent = 2, ensure_ascii = False)
