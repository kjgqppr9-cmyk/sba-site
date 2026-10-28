# sba-site — sba1.co.kr 홈페이지 전용 정적 파일 (jsDelivr 로 서비스)
- **50MB 를 넘기지 않는다**(jsDelivr 한도 — 넘으면 cdn·fastly 가 'Package size exceeded' 403). 큰 이미지·카드뉴스·블로그 사진은 다른 저장소에.
- 주소: `https://fastly.jsdelivr.net/gh/kjgqppr9-cmyk/sba-site@<태그>/<경로>` — 태그는 한 번 쓰면 다시 쓰지 않는다(예 s1029a → s1103a).
- 절차: 파일 수정(안의 절대 주소 태그도 새 태그로) → 커밋 → `git tag <태그>` → `git push origin main <태그>` → fastly 로 전 파일 200 확인 → 식스샵 블록 BASE·테마 head 태그 교체 → 발행.
- 폴더: blog/blog.js · main · about · consult · lec · hexd · sfx · chars(무손실 WebP) · chars/thumb(400px PNG) · 루트 몇 장.
