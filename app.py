import json
import os
from datetime import datetime

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

APADRINA_URL = "https://www.stockcrowd.com/p2p/1799/Apadrinaunsomriure"

TOP_N = 7        # quants jugadors es guarden
MAX_NOM = 20     # longitud màxima del nom

# Carpeta del projecte (independent de on estigui instal·lat)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Les dades es guarden FORA de la carpeta del projecte, en una carpeta germana,
# perquè un "git pull" no les toqui.
DATA_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "dades_ambNassos"))
DATA_FILE = os.path.join(DATA_DIR, "top7.json")


def llegir_top():
    """Retorna la llista de puntuacions guardades (o buida si no n'hi ha)."""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            dades = json.load(f)
        return dades if isinstance(dades, list) else []
    except (OSError, json.JSONDecodeError):
        return []


def guardar_top(llista):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(llista, f, ensure_ascii=False, indent=2)


@app.route("/")
def joc():
    return render_template("joc.html", apadrina_url=APADRINA_URL)


@app.route("/api/top")
def api_top():
    return jsonify(llegir_top()[:TOP_N])


@app.route("/api/puntuacio", methods=["POST"])
def api_puntuacio():
    dades = request.get_json(silent=True) or {}

    nom = str(dades.get("nom", "")).strip()[:MAX_NOM] or "Anònim"
    try:
        punts = int(dades.get("punts"))
    except (TypeError, ValueError):
        return jsonify({"error": "Puntuació no vàlida"}), 400

    llista = llegir_top()
    entrada = {
        "nom": nom,
        "punts": punts,
        "data": datetime.now().isoformat(timespec="seconds"),
    }
    llista.append(entrada)
    # Més punts primer; a igualtat de punts, qui va arribar abans
    llista.sort(key=lambda e: (-e["punts"], e["data"]))
    llista = llista[:TOP_N]
    guardar_top(llista)

    posicio = llista.index(entrada) + 1 if entrada in llista else None
    return jsonify({"top": llista, "posicio": posicio})


if __name__ == "__main__":
    # Només per a proves locals. En producció s'usa gunicorn.
    app.run(host="127.0.0.1", port=8204, debug=False)
