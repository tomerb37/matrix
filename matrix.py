from random import randint


class Matrix(object):
    _DIRECTIONS = [[-1, -1],
                   [-1, 0],
                   [-1, 1],
                   [0, -1],
                   [0, 1],
                   [1, -1],
                   [1, 0],
                   [1, 1]]

    def __init__(self, rows, cols, mat=None):
        self.mat_id = None
        self._rows = rows
        self._cols = cols
        self._islands = None
        self._is_solved = False

        if mat is None:
            self._mat = [[0] * cols for _ in range(rows)]
        else:
            self._mat = mat

    def random_init(self):
        # Randomly get amount of points on the matrix.
        coords_amount = randint(0, self._rows * self._cols)

        # Randomly select coords on the matrix to fill their cells.
        for _ in range(coords_amount):
            self._mat[randint(0, self._rows - 1)][randint(0, self._cols - 1)] = -1

    def _get_island_adjacent(self, row, col):
        adjacents = []

        # Scan cell's neighbours in the matrix.
        for x, y in self._DIRECTIONS:
            row_n = row + x
            col_n = col + y

            # If the a cell is part of the island - mark it and add it to the
            # array, so _mark_island will scan its neighbours ass well.
            if 0 <= row_n <= (self._rows - 1) and \
                    0 <= col_n <= (self._cols - 1) and \
                    self._mat[row_n][col_n] == -1:
                self._mat[row_n][col_n] = self._islands
                adjacents.append((row_n, col_n))

        return adjacents

    def _mark_island(self, island_coords):
        """
        This method mark the cell in an island.
        It is done in loops because python has a memory leak with large
        recursions.
        Below there is the recursion method commented.

        This function iterates the cells and gathers the island's cells
        in an array. Every time scans the next layer.

        """

        # Mark first row, col pair.
        self._mat[island_coords[0][0]][island_coords[0][1]] = self._islands

        while island_coords:
            next_layer = []

            for row, col in island_coords:

                next_layer.extend(self._get_island_adjacent(row, col))

            island_coords = next_layer

    # def _mark_island(self, row, col):
    #     self._mat[row][col] = self._islands
    #
    #     # Check adjacent cells.
    #     for x, y in self._DIRECTIONS:
    #         row_n = row + x
    #         col_n = col + y
    #
    #         # If the cell is marked - it is part of the island,
    #         # and so, call the function again with it.
    #         if 0 <= row_n <= (self._rows - 1) and \
    #                 0 <= col_n <= (self._cols - 1) and \
    #                 self._mat[row_n][col_n] == -1:
    #             self._mark_island(row_n, col_n)

    def solve(self):
        if self._is_solved:
            return
        self._islands = 0

        for i in range(self._rows):
            for j in range(self._cols):

                # Every undiscovered 'marked' cell is a new island.
                if self._mat[i][j] == -1:
                    self._islands += 1
                    self._mark_island([(i, j)])

        self._is_solved = True

    def json(self):
        return {
            'id': self.mat_id,
            'islands': self._islands,
            'matrix': self._mat
        }

    def pretty_print(self):
        for row in self._mat:
            print('\t'.join(str(x) for x in row))


class MatrixManager(object):
    def __init__(self):
        self._matrices = []

    def add(self, matrix):
        mat_id = len(self._matrices)
        matrix.mat_id = mat_id
        self._matrices.append(matrix)

    def get(self, mat_id):
        try:
            return self._matrices[mat_id]
        except IndexError:
            return None


matrices = MatrixManager()
