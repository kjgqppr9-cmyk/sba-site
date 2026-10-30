"""강의 운영판 커스텀 스페이스 패키지 만들기: python build_zip.py → ops/dist/sba-lecture-ops.zip (zip 최상위에 spec.json·index.html, R1·R2)"""
import os, zipfile, json
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'lecture-ops')
OUT = os.path.join(HERE, 'dist', 'sba-lecture-ops.zip')
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.load(open(os.path.join(SRC, 'spec.json'), encoding='utf8'))
files = ['spec.json', 'index.html', 'icon.svg', 'assets/app.js', 'assets/app.css']
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in files:
        z.write(os.path.join(SRC, *f.split('/')), f)
print(OUT, os.path.getsize(OUT))
with zipfile.ZipFile(OUT) as z:
    print(z.namelist())
