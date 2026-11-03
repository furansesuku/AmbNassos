from flask import Flask, render_template

app = Flask(__name__)

APADRINA_URL = "https://www.stockcrowd.com/p2p/1799/Apadrinaunsomriure"


@app.route("/")
def index():
    return render_template("index.html", apadrina_url=APADRINA_URL)


@app.route("/joc")
def joc():
    return render_template("joc.html", apadrina_url=APADRINA_URL)


if __name__ == "__main__":
    # Només per a proves locals. En producció s'usa gunicorn.
    app.run(host="127.0.0.1", port=8204, debug=False)
