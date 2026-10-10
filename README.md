# cryptogorac.com

Statički sajt (HTML + CSS + JS), bez build koraka. GitHub Pages ga objavljuje automatski
na svaki push u `main` (`.github/workflows/static.yml`).

## Struktura

```
*.html                 stranice (zajednički header i footer su isti u svakoj)
404.html               stranica za nepostojeće linkove
assets/css/site.css    sav stil sajta (boje i veličine su na vrhu, u :root)
assets/js/site.js      meni, "nazad na vrh", animacije, cijene BTC/ETH, Tawk chat
assets/img/            slike (WebP), ikonice (icons.svg), favicon, og-image
assets/fonts/          Poppins, lokalno (bez Google Fonts poziva)
sitemap.xml, robots.txt, site.webmanifest
```

## Lokalno pokretanje

```
python3 -m http.server 8080
```
pa otvorite http://localhost:8080

## Napomene

- Nova slika: konvertujte u WebP (npr. `cwebp -q 80 slika.jpg -o slika.webp`) i obavezno
  upišite `width` i `height` u `<img>` tag.
- Kad mijenjate meni ili footer, promjenu treba unijeti u svaki `.html` fajl.
- Kad mijenjate CSS/JS, povećajte `?v=` verziju u `<link>`/`<script>` tagovima da bi
  posjetioci dobili novu verziju.
