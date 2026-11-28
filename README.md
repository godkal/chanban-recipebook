# 찬밥식당 레시피북 (배포본)

`work/찬밥식당_레시피북.html` 을 `index.html` 로 올린 정적 사이트. GitHub Pages(main, root)로 서비스한다.

- 상세 레시피 750개 / 영상 139편 + 쇼츠 369편
- 조리 단계별 실제 스틸컷: 125개 요리 · 353장 (`stills/<key>/<번호>.webp`, 640×360 WebP)
- 서비스 워커 캐시: `chanban-recipebook-v16`

갱신: 원본에서 `python3 build.py` → `cp` 로 `index.html`·`sw.js`·`stills/` 반영 → commit·push.
