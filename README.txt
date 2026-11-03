ambNassos
=========

Web de la campanya #RiuadeNassos (Festeve). Inclou una pàgina principal amb
la crida a apadrinar un somriure i el joc "AmbNassos".


1. ESTRUCTURA DEL PROJECTE
--------------------------

ambNassos/
├── app.py                      Aplicació Flask (ruta / mostra el joc)
├── requirements.txt            Dependències (flask, gunicorn, python-dotenv)
├── .gitignore                  Fitxers que no es pugen a GitHub (.env, .venv...)
├── .env.example                Plantilla de variables d'entorn (el .env real NO es puja)
├── README.txt                  Aquest fitxer
├── templates/
│   └── joc.html                Pàgina del joc AmbNassos (és la pàgina principal)
├── static/
│   ├── style.css               Estils de tota la web (incloent el joc i la versió mòbil)
│   ├── joc.js                  Lògica del joc
│   └── img/
│       ├── nen_content.png     Nen somrient (cara contenta)
│       ├── nen_trist.png       Nen amb llàgrima i boca trista (cara trista)
│       ├── nena_content.png    Nena somrient (cara contenta)
│       └── nena_trist.png      Nena amb llàgrima i boca trista (cara trista)
└── deploy/
    ├── festeve-ambNassos.service   Servei systemd d'usuari
    └── nginx-location.conf         Bloc nginx (plantilla genèrica, cal comparar-la)


2. RUTES DE L'APLICACIÓ
-----------------------

  /        Joc AmbNassos (pàgina principal).
           El botó "Apadrina un somriure" de la pantalla final porta a StockCrowd.

Totes les rutes d'enllaços, fitxers estàtics i formularis són RELATIVES
(sense "/" inicial), perquè l'app funciona darrere del prefix
/festeve/ambNassos/.


3. EXECUTAR-LA EN LOCAL (PC, Windows)
-------------------------------------

  cd C:\PROVES_IA\ambNassos
  python -m venv .venv
  .venv\Scripts\python.exe -m pip install -r requirements.txt
  .venv\Scripts\python.exe app.py

  Després obrir al navegador:
    http://127.0.0.1:8204/        joc AmbNassos

  Per aturar-la: Ctrl+C. Si canvies fitxers estàtics (CSS, JS, imatges),
  recarrega la pàgina amb Ctrl+F5.


4. DESPLEGAMENT AL SERVIDOR
---------------------------

Flux: PC -> git push a GitHub -> git pull al servidor.

  Dades del projecte:
    Port:              8204 (dins del rang 8200-8299; 8200-8203 ja ocupats)
    Directori:         /var/www/festeve/ambNassos
    URL pública:       https://neusiretos.duckdns.org/festeve/ambNassos/
    Servei systemd:    festeve-ambNassos.service (usuari, no cron)
    Escolta:           només 127.0.0.1, amb gunicorn i venv propi (.venv)

  Passos al servidor (primera vegada):
    cd /var/www/festeve
    git clone <URL_DEL_REPO> ambNassos
    cd ambNassos
    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
    cp .env.example .env
    mkdir -p ~/.config/systemd/user
    cp deploy/festeve-ambNassos.service ~/.config/systemd/user/
    systemctl --user daemon-reload
    systemctl --user enable --now festeve-ambNassos.service

  Actualitzacions posteriors:
    cd /var/www/festeve/ambNassos
    git pull
    systemctl --user restart festeve-ambNassos.service

  Nginx:
    Afegir el bloc de deploy/nginx-location.conf dins de
    /etc/nginx/snippets/festeve/festeve.conf (després de comparar-lo amb el
    de benzineres) i aplicar-lo amb:
      sudo nginx -t && sudo systemctl reload nginx
    Després comprovar la URL al navegador.

  Nota: els serveis d'usuari només continuen en marxa després de tancar la
  sessió si el compte té "lingering" activat (sudo loginctl enable-linger
  <usuari>). Això requereix permís explícit de sudo.

  Cap contrasenya ni clau va al codi: van al fitxer .env, que està al .gitignore.


5. JOC "SOMRIURES EXPRÉS"
-------------------------

  Objectiu: fer somriure el màxim de persones.

  - Apareixen cares de nens i nenes, unes contentes i altres tristes.
  - El jugador ha de clicar només les tristes: cada una transformada suma 1 punt.
  - Si clica una cara contenta, perd 1 punt.
  - La partida dura 40 segons. El joc comença quan el jugador prem "Comença!".
  - Al final apareix el missatge amb la puntuació real i el botó
    "Apadrina un somriure". També hi ha "Torna a jugar".

  Missatge final (amb la puntuació del jugador):
    "Has aconseguit transformar X cares tristes en somriures! Els Pallapupas
    també ho fan cada dia als hospitals. Ajuda'ns a continuar-ho fent possible."

  Adaptació: funciona en ordinador i en mòbil. La graella es redimensiona amb
  la finestra i s'eviten zooms accidentals amb el doble toc.

  Paràmetres configurables a static/joc.js:
    DURATION   durada de la partida en segons (40)
    SIZE       nombre de cel·les (16 = graella 4x4)
    SPAWN_MS   cada quant apareix una cara nova (650 ms)
    LIFE_MS    quant de temps es queda una cara en pantalla (2200 ms)


6. IMATGES DEL JOC
------------------

  Les quatre imatges de static/img/ són il·lustracions generades amb IA.
  Origen i tractament:
    - nen_content.png i nena_content.png: retall de la imatge original
      generada amb IA (dos personatges en una sola imatge, separats al centre).
    - nen_trist.png i nena_trist.png: modificació de les anteriors. S'ha
      tapat la boca oberta amb el to de la pell, s'ha dibuixat una boca
      baixa i s'han afegit llàgrimes sota els ulls.

  PENDENT: comprovar les condicions d'ús de l'eina d'IA utilitzada abans de
  publicar la web (sobretot si és per a una campanya pública o benèfica),
  i si cal, citar-ne l'autoria.

  Les versions tristes són retocs manuals amb Python (Pillow) i no són
  il·lustracions originals; és possible que els ulls quedin encara en forma
  d'arc, com els de les cares contentes.


7. HISTORIAL DE CANVIS
----------------------

  v0.1  Base del projecte: pàgina principal amb l'estil de la referència
        (fons crema, targetes blanques, botons blaus i vermells), botó
        "Apadrina un somriure" que redirigeix a StockCrowd, configuració
        per a Flask + gunicorn i desplegament darrere de /festeve/ambNassos/.

  v0.2  Afegit el joc "AmbNassos" (ruta /joc, joc.js, joc.html).
        Primer amb cares SVG de pallasso, després amb cares SVG de nen i
        nena i, finalment, amb un estil de dibuix senzill.

  v0.3  Adaptació del joc a mòbil i a finestres de diferents mides.

  v0.4  Substitució de les cares SVG per imatges de nen i nena (contentes
        i tristes), retallades i retocades a partir d'una imatge generada
        amb IA. Eliminada la funció SVG antiga.

  v0.5  Canvi de nom del joc: "Somriures exprés" passa a "AmbNassos"
        (títol de la pàgina, targeta de la pàgina principal i documentació).

  v0.6  La pàgina principal és directament el joc. Eliminada la pàgina de
        placeholders (menús d'exemple) i els estils que no formaven part
        del joc. La ruta /joc ja no existeix; el joc és a la arrel.
