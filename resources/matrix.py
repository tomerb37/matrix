from flask_restful import Resource, reqparse

import consts
from matrix import Matrix, matrices


class MatrixCreation(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(consts.ROWS,
                            type=int,
                            required=True,
                            help="This field cannot be left blank!"
                            )
        parser.add_argument(consts.COLS,
                            type=int,
                            required=True,
                            help="This field cannot be left blank!"
                            )

        data = parser.parse_args()

        matrix = Matrix(data[consts.ROWS], data[consts.COLS])
        matrix.random_init()

        matrices.add(matrix)

        return matrix.json()


class MatrixSolveRandom(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(consts.MATRIX_ID,
                            type=int,
                            required=True,
                            help="This field cannot be left blank!"
                            )

        data = parser.parse_args()

        matrix = matrices.get(data[consts.MATRIX_ID])
        matrix.solve()

        return matrix.json()


class MatrixSolveDrawn(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(consts.ROWS,
                            type=int,
                            required=True,
                            help="This field cannot be left blank!"
                            )
        parser.add_argument(consts.COLS,
                            type=int,
                            required=True,
                            help="This field cannot be left blank!"
                            )
        parser.add_argument(consts.MATRIX,
                            type=list,
                            action='append',
                            required=True,
                            help="This field cannot be left blank!"
                            )

        data = parser.parse_args()

        matrix = Matrix(data[consts.ROWS], data[consts.COLS], data[consts.MATRIX])
        matrix.solve()

        return matrix.json()
