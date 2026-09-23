# Inštalacije Košnik – spletna stran

Statična stran (HTML + CSS + JS, brez knjižnic) za **Inštalacije centralnih in vodovodnih naprav, Nejc Košnik s.p.**, Jezerska cesta 78b, 4000 Kranj · 031 444 466 · instalacijekosnik@gmail.com.

## Datoteke

| Datoteka | Vsebina |
|---|---|
| `index.html` | Prva stran: uvodna animacija, hero, storitve, zamrzovanje cevi, o nas, postopek, galerija, mnenja, vprašanja, kontakt z obrazcem in zemljevidom |
| `vodovodne-instalacije-kranj.html` | »Vodovodar Kranj« – vodovod, popravila, menjava bojlerja |
| `centralno-ogrevanje-kranj.html` | Kotlovnice, radiatorji (tudi z zamrzovanjem cevi), kotli, plin |
| `toplotne-crpalke-kranj.html` | Toplotne črpalke za sanitarno vodo in ogrevanje |
| `talno-ogrevanje-kranj.html` | Vodno talno, stensko in stropno gretje |
| `adaptacija-kopalnic-kranj.html` | Prenova kopalnic |
| `zasebnost.html` | Politika zasebnosti in piškotkov |
| `404.html` | Stran ne obstaja (Vercel jo uporabi samodejno) |
| `assets/styles.css`, `assets/main.js` | Slogi in vse animacije |
| `assets/img/` | Fotografije v webp (dve velikosti), `apple-touch-icon.png` |
| `assets/og-image.jpg` | Slika ob deljenju povezave (Facebook, WhatsApp) |

Glava, noga in ikone so v vseh 8 HTML datotekah enake – ob spremembi (npr. telefona) popravi vse.

## Pred objavo – DEPLOY STEP

Poišči `DEPLOY STEP` po vseh datotekah:

1. **Domena** – povsod je `https://nejc-kosnik.vercel.app`. Če bo drugačna, zamenjaj v vseh `.html`, `sitemap.xml` in `robots.txt`.
2. **E-pošta** – napisano je bilo `inštalacijekošnik@gmail.com`, Gmail pa ne dovoli šumnikov, zato je uporabljeno **instalacijekosnik@gmail.com**. Potrdi z Nejcem.
3. **Delovni čas** – Google navaja le »odpre se ob 7.00«. Potrdi dni in uro zaključka.
4. **Kraji** – seznam okoliških krajev (Šenčur, Naklo, Cerklje, Preddvor, Tržič, Škofja Loka) potrdi z Nejcem.
5. **O nas** – dopolni z Nejčevo zgodbo in fotografijo.
6. **Kopalnice** – ali keramiko polaga sam ali s partnerjem.
7. **Zasebnost** – rok hrambe povpraševanj (zdaj 12 mesecev) in ponudnik gostovanja (zdaj Vercel).
8. **Galerija** – zdaj so 4 prave fotografije z njegovega profila na Mojmojster. Ko pošlje nove, dodaj `<figure class="gal__item">` po istem vzorcu (webp v dveh velikostih, npr. z `ffmpeg`).

## Po objavi (najpomembnejše za Google)

1. **Google Business Profile** – na profilu piše »Dodaj spletno mesto«. Nejc naj tam doda povezavo do strani. Za lokalno iskanje (»vodovodar Kranj«) je to močnejše od vsega na sami strani.
2. **Google Search Console** – dodaj domeno, pošlji `sitemap.xml`.
3. **Mnenja** – gumb »Oddajte mnenje na Googlu« vodi naravnost v obrazec za mnenje (place_id `ChIJmQk75JK3ekcRcaROoJIFhr0`). Nejc naj povezavo pošlje zadovoljnim strankam – več svežih mnenj = višje na zemljevidu.
4. Preveri hitrost na [PageSpeed Insights](https://pagespeed.web.dev/). Lokalne meritve niso bile zanesljive, ker je računalnik med testom poganjal igro (CPU 100 %).

## SEO – ključne besede (Google Autocomplete, 23. 9. 2026)

- »inštalater« → prvi predlog **inštalater strojnih inštalacij** → h1 in naslov strani.
- »vodovodar« → **vodovodar kranj** je med prvimi mesti → podstran `vodovodne-instalacije-kranj.html`.
- »inštalacije kranj« → **vodovodne inštalacije kranj**, **strojne inštalacije kranj**.
- »toplotna črpalka« → **toplotna črpalka za sanitarno vodo** je najpogostejši predlog.
- »menjava bojlerja« → **menjava bojlerja cena**; »menjava radiatorjev« → **v bloku** (to pokrije zamrzovanje cevi).
- »subvencija toplotna črpalka« → **Eko sklad** (odgovor v vprašanjih).

Vsaka podstran ima svoj naslov, opis, kanonični URL, drobtine in strukturirane podatke (`Service`, `BreadcrumbList`, `FAQPage`). Prva stran ima `Plumber` + `HVACBusiness` z naslovom, koordinatami, matično in davčno številko.

## Animacije

- **Uvod** (enkrat na sejo, `sessionStorage` ključ `nk-uvod`): skica ventila se izriše, kolo se zavrti, po cevi steče rdeča voda, zavesa se dvigne. Klik, kolešček ali tipka ga preskoči.
- **Ob drsenju**: besede naslovov izza maske, fotografije z masko, rdeča cev na vrhu (napredek), cevovod ob levem robu (od 1440 px), trak s storitvami, diagram zamrzovanja v treh korakih, manometer z oceno, števci, polnjenje cevi v postopku, vodoravna galerija (namizje).
- Premika se samo `transform`, `opacity` in `clip-path`. Drsenje je izvorno (`scroll-behavior: smooth`), brez knjižnice, ki bi prevzela kolešček.
- **Zmanjšano gibanje**: kdor ima v sistemu vklopljeno zmanjšano gibanje (Windows: izklopljeni »Učinki animacije«), dobi stran brez premikov in brez uvoda – vsebina je takoj vidna. Za predogled animacij na takem računalniku dodaj `?gibanje=1` na konec naslova (npr. `index.html?gibanje=1`).

## Piškotki

Brez soglasja stran uporablja le nujno shrambo (`nk-piskotki`, `nk-uvod`). Zemljevid Google se naloži šele po kliku »Prikaži zemljevid« ali po »Sprejmi vse«. Gumba »Sprejmi vse« in »Samo nujni« sta enakovredna. Nastavitve so dostopne v nogi.

## Obrazec

Brez strežnika: sestavi e-pošto (`mailto:`) ali SMS na 031 444 466. Če bo kdaj potreben pravi obrazec, zamenjaj oddajo v `assets/main.js` (razdelek 8).
