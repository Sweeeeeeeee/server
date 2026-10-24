import json

def format(fin, fout):
    with open(fin, "r", encoding = "utf-8") as f:
        data = json.load(f)

    formattedData = []

    for item in data:
        if " : " in item:
            q, t = item.split(" : ", 1)
            q = q.strip()
            t = t.strip()
            
            a = [ans.strip() for ans in t.split(",")]
            
            formattedData.append({
                    "q": q,
                    "a": a,
                    "t": t
                }
            )

    with open(fout, "w", encoding = "utf-8") as f:
        json.dump(formattedData, f, indent = 2, ensure_ascii = False)

def formatInverted(fin, fout):
    with open(fin, "r", encoding = "utf-8") as f:
        data = json.load(f)

    invertedMap = {}

    for item in data:
        for translation in item["a"]:
            if translation not in invertedMap:
                invertedMap[translation] = []
            
            if item["q"] not in invertedMap[translation]:
                invertedMap[translation].append(item["q"])

    formattedData = []

    for q, a in invertedMap.items():
        formattedData.append({
                "q": q,
                "a": a,
                "t": q
            }
        )

    with open(fout, "w", encoding = "utf-8") as f:
        json.dump(formattedData, f, indent = 2, ensure_ascii = False)

def translate(text, alphabet):
    return "".join(alphabet.get(char.lower(), char) for char in text)

def applyCipher(fin, fout, alphabetF):
    with open(alphabetF, "r", encoding = "utf-8") as f:
        alphabet = json.load(f)
        
    with open(fin, "r", encoding = "utf-8") as f:
        data = json.load(f)

    encodedData = []

    for item in data:
        encodedData.append({
                "q": item["q"],
                "a": [translate(ans, alphabet) for ans in item["a"]],
                "t": item["t"]
            }
        )

    with open(fout, "w", encoding = "utf-8") as f:
        json.dump(encodedData, f, indent = 2, ensure_ascii = False)

def cut(fin, fout, x):
    with open(fin, "r", encoding = "utf-8") as f:
        data = json.load(f)

    cutData = data[:x]

    with open(fout, "w", encoding = "utf-8") as f:
        json.dump(cutData, f, indent = 2, ensure_ascii = False)
    
cut("ii1Enc.json", "eeetokkk.json", 1000)
cut("ii2Enc.json", "kkktoeee.json", 1000)
# formatInverted("i1.json", "i2.json")
# applyCipher("ii1.json", "ii1Enc.json", "alphabet.json")
