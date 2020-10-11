import sys

from flask_restful import Api
from flask import Flask, render_template

from resources.matrix import (
    MatrixCreation,
    MatrixSolveRandom,
    MatrixSolveDrawn
)

sys.setrecursionlimit(1000000)

app = Flask(__name__)

api = Api(app)

api.add_resource(MatrixCreation, '/get_matrix')
api.add_resource(MatrixSolveRandom, '/solve_random')
api.add_resource(MatrixSolveDrawn, '/solve_drawn')


@app.route('/')
def home():
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
