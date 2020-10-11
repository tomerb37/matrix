const baseUrl = 'http://127.0.0.1:5000';
const MATRIX_ID = 'matrix_id';
const ROWS_ITEM = 'rows';
const COLS_ITEM = 'cols';

document.getElementById('randomize').addEventListener('click', function() {
    let matrixMeasures = validateInput()

    if (matrixMeasures === null) {
        return;
    }

    // Get a randomized matrix from the server and build it.
    sendPost(baseUrl + '/get_matrix', matrixMeasures).then(data => {
        sessionStorage.setItem(MATRIX_ID, data.id);

        let tbody = buildMatrix(data.matrix, data.islands);

        let table = document.getElementById('matrix-table');
        table.appendChild(tbody);

        document.getElementById('matrix-container').style.display = 'flex';
        document.getElementById('create-matrix').style.display = 'none';
    });
});

document.getElementById('draw').addEventListener('click', function() {
    let matrixMeasures = validateInput()

    if (matrixMeasures === null) {
        return;
    }

    sessionStorage.setItem(ROWS_ITEM, matrixMeasures.rows);
    sessionStorage.setItem(COLS_ITEM, matrixMeasures.cols);

    let matrix = []
    for (let i = 0; i < matrixMeasures.rows; i++) {
        (matrix[i] = []).length = matrixMeasures.cols;
        matrix[i].fill(0);
    }
    let tbody = buildMatrix(matrix, null);

    let table = document.getElementById('matrix-table');
    table.appendChild(tbody);

    addClickEvents(matrixMeasures.rows, matrixMeasures.cols);

    document.getElementById('matrix-container').style.display = 'flex';
    document.getElementById('create-matrix').style.display = 'none';
});

document.getElementById('solve-btn').addEventListener('click', function() {
    // Get matrix id stored in the session.
    let matrix_id = sessionStorage.getItem(MATRIX_ID);

    // If matrix Id exists - it means the matrix was created on the server
    // The matrix exists on the and only the matrix id is necessary.
    if (matrix_id) {
        solveRandomized({
            matrix_id: matrix_id
        });
        return;
    }

    // Matrix was drawn on client so rows and column numbers will be sent
    // For matrix creation.
    solveDrawn(sessionStorage.getItem(ROWS_ITEM), sessionStorage.getItem(COLS_ITEM));

});

document.getElementById('restart-btn').addEventListener('click', function() {
    // Remove current matrix id from the session.
    sessionStorage.removeItem(MATRIX_ID);
    sessionStorage.removeItem(ROWS_ITEM);
    sessionStorage.removeItem(COLS_ITEM);

    // Remove current matrix from the screen.
    removeMatrix()

    let h1 = document.getElementById('islands-text');
    h1.removeChild(h1.childNodes[0]);

    document.getElementById('create-matrix').style.display = 'flex';
    document.getElementById('restart').style.display = 'none';
    document.getElementById('solve').style.display = 'flex';
    document.getElementById('matrix-container').style.display = 'none';
    document.getElementById('islands').style.display = 'none';
    document.getElementById('mat-measures').value = '';

});

function validateInput() {
    let measuresInput = document.getElementById("mat-measures");
    let warningText = document.getElementById('warning-text');

    // Validate if the input matches the pattern.
    let measuresMatch = RegExp('^\\s*([0-9]+)\\s*,\\s*([0-9]+)\\s*$').exec(measuresInput.value);

    if (measuresMatch === null) {
        warningText.style.display = 'flex';
        measuresInput.classList.add('is-invalid');

        return null;
    }

    measuresInput.classList.remove('is-invalid');
    warningText.style.display = 'none';

    return {
        rows: measuresMatch[1],
        cols: measuresMatch[2]
    };
}

async function sendPost(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return response.json()
}

function solveRandomized(data) {
    sendPost(baseUrl + '/solve_random', data).then(data => {
        setSolvedMatrix(data);
    });
}

function solveDrawn(rows, cols) {
    let data = {
        matrix: [],
        rows: rows,
        cols: cols
    };
    let td;

    for (let i = 0; i < data.rows; i++) {
        data.matrix[i] = []

        for (let j = 0; j < data.cols; j++) {
            td = document.getElementById(i + '-' + j);
            data.matrix[i][j] = Number(td.dataset.val);
        }
    }

    sendPost(baseUrl + '/solve_drawn', data).then(data => {
        setSolvedMatrix(data);
    });
}

function setSolvedMatrix (data) {
    // Build the solved matrix.
    let tbody = buildMatrix(data.matrix, data.islands);
    removeMatrix();

    let table = document.getElementById('matrix-table');
    table.appendChild(tbody);

    let text = document.createTextNode('FOUND ' + data.islands + ' ISLANDS!');
    let h1 = document.getElementById('islands-text');
    h1.appendChild(text);

    document.getElementById('solve').style.display = 'none';
    document.getElementById('islands').style.display = 'flex';
    document.getElementById('restart').style.display = 'flex';
}

function removeMatrix() {
    let table = document.getElementById('matrix-table');
    table.removeChild(table.childNodes[0]);
}

function buildMatrix(matrix, islands) {
    let colors = buildColorsArray(islands + 1);
    let tbody = document.createElement('tbody')
    let tr;
    let td;


    // Every cell in the table represents a cell in the matrix.
    for (let i = 0; i < matrix.length; i++) {
        tr = document.createElement('tr');

        for (let j = 0; j < matrix[0].length; j++) {
            td = document.createElement('td');
            td.id = i + '-' + j;
            td.dataset.val = matrix[i][j];
            let color;

            if (matrix[i][j] === -1) {
                color = '#000';
            } else {
                color = colors[matrix[i][j]];
            }

            td.style.background = color;

            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    return tbody;
}

function addClickEvents(rows, cols) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            (function() {
                let td = document.getElementById(i +'-' + j);
                td.addEventListener('click', function() {
                    if (td.dataset.val === '0') {
                        td.dataset.val = '-1';
                        td.style.backgroundColor = '#000';
                    } else {
                        td.dataset.val = '0';
                        td.style.backgroundColor = '#fff';
                    }
                });
            })();

        }
    }
}

function buildColorsArray(colorsAmount) {
    let colors = ['#fff'];

    // For the randomized matrix only black and white colors needed.
    if (colorsAmount === null) {
        return colors;
    }

    // Get random colors for every found island.
    while (colors.length < colorsAmount) {
        let color = getRandomColor();
        if (color !== '#fff') {
            colors.push(color);
        }
    }

    return colors;
}

function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 3; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}