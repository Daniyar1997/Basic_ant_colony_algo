let algoParams = {

    antsCount: 5, //Количество муравьев
    iterationsCount: 5, //Количество итераций
    fieldSize: 25, //Размер поля. Поле квадратное
    matrixSize: 0, //Размер матрицы. Размер поля в квадрате
    startVertex: 0, //Начальная вершина, m
    endVertex: 600, //Конечная вершина, m

    ALPHA: 1, //Константа
    BETA: 1, //Константа
    Q: 4, //Константа
    T: 0.6, //Испарение феромона
    P: 0.5, //Базовое количество феромонов

    availableVertexes: [], //Доступные для перехода вершины
    pTransitions: [], //Вероятности переходов

    ways: [], //Пути, пройденные муравьями
    distances: [], //Расстояния, пройденные муравьями
    endFound: [], //Конечная вершина для i-го муравья найдена

    bestWay: '', //Лучший путь
    bestDistance: Infinity, //Лучшее расстояние
    bestDistanceIteration: Infinity, //Итерация лучшего расстояния

}

let mAdj = [ //Матрица смежности
    [9, 1, 1, 0],
    [1, 9, 0, 1],
    [1, 0, 9, 1],
    [0, 1, 1, 9],
];

let mVisited = [ //Матрица посещенных вершин
    [9, 0, 0, 0],
    [0, 9, 0, 0],
    [0, 0, 9, 0],
    [0, 0, 0, 9],
];

let mPheromones = [ //Матрица феромонов
    [9, algoParams.P, algoParams.P, 0],
    [algoParams.P, 9, 0, algoParams.P],
    [algoParams.P, 0, 9, algoParams.P],
    [0, algoParams.P, algoParams.P, 9],
];

document.querySelector('.calculating-run__button')
.onclick = readInputData;

function readInputData() { //Чтение данных


    let field = document.querySelector('.algo-view');
    let rows = field.querySelectorAll('.js-view-container');

    if (rows.length == 0) {
        comment('Поле не создано', 'red');
        return false;
    }

    algoParams.fieldSize = rows.length; //Размер поля

    let cells = field.querySelectorAll('.js-view-container__cell');
    let startVertex = -1;
    let endVertex = -1;
    let index = 0;
    for (let elem of cells) { //Определение номеров вершина A и B
        if (elem.classList.contains('js-view-container__start-cell')) {
            startVertex = index;
        }
        if (elem.classList.contains('js-view-container__end-cell')) {
            endVertex = index;
        }
        if (startVertex != -1 && endVertex != -1) break;
        index++;
    }

    if (startVertex == -1 || endVertex == -1) {
        comment('Не установлена начальная и/или конечная вершина', 'red');
        return false;
    }
    algoParams.startVertex = startVertex;
    algoParams.endVertex = endVertex;

    let form = document.forms.algo_params;
    let newValue = 0;

    //Количество муравьев
    newValue = form.elements.ants_count.value
    if (newValue == '' || newValue < 1 || newValue > 10) {
        comment('Неверное количество муравьев', 'red');
        return false;
    }
    algoParams.antsCount = Number(newValue);

    //Количество итераций
    newValue = form.elements.iterations_count.value
    if (newValue == '' || newValue < 1 || newValue > 25) {
        comment('Неверное количество итераций', 'red');
        return false;
    }
    algoParams.iterationsCount = Number(newValue)

    //ALPHA
    newValue = form.elements.alpha.value;
    if (newValue == '' || newValue < 0.01 || newValue > 1) {
        comment('Неверный коэффициент ALPHA', 'red');
        return false;
    }
    algoParams.ALPHA = Number(newValue);

    //BETA
    newValue = form.elements.beta.value;
    if (newValue == '' || newValue < 0.01 || newValue > 1) {
        comment('Неверный коэффициент BETA', 'red');
        return false;
    }
    algoParams.BETA = Number(newValue);

    //Q
    newValue = form.elements.q.value;
    if (newValue == '' || newValue < 1 || newValue > 5) {
        comment('Неверный коэффициент Q', 'red');
        return false;
    }
    algoParams.Q = Number(newValue);

    //T
    newValue = form.elements.t.value;
    if (newValue == '' || newValue < 0.01 || newValue > 0.99) {
        comment('Неверный коэффициент T', 'red');
        return false;
    }
    algoParams.T = Number(newValue);

    //P
    newValue = form.elements.p.value;
    if (newValue == '' || newValue < 0.01 || newValue > 5) {
        comment('Неверный коэффициент P', 'red');
        return false;
    }
    algoParams.P = Number(newValue);

    clearPreviousBestSolution(); //Очистить предыдущее лучшее рещение
    formMatrixes(); //Формирование матриц
    updateMAdjByWalls(); //Обновить матрицу смежности (согласно наличию стен)
    mainAlgo(); //Главный алгоритм

}

function clearPreviousBestSolution() {

    let field = document.querySelector('.algo-view');
    let cells = field.querySelectorAll('.js-view-container__cell');
    for (let elem of cells) {
        elem.classList.remove('js-view-container__way-cell');
        if (!elem.classList.contains('js-view-container__start-cell')) {//В простых ячейках отмечаем порядок прохождения пути
            if (!elem.classList.contains('js-view-container__end-cell')) {
                elem.textContent = '';
            }
        }
    }

    algoParams.bestWay = '';
    algoParams.bestDistance = Infinity;
    algoParams.bestDistanceIteration = Infinity;

}


function mainAlgo() {

   for (let i = 0; i < algoParams.iterationsCount; i++) {
       for (let j = 0; j < algoParams.antsCount; j++) {

            let m = algoParams.startVertex; // m - строки, n - столбцы матрицы смежности
            algoParams.ways.push(`${m}`); //Добавить стартовую вершину в путь муравья
            algoParams.distances.push(0); //Пройденные муравьями расстояния
            algoParams.endFound.push(false); //Флаги, что путь найден

            do { //Проход муравья

                algoParams.availableVertexes = getAvailableVertexes(m); //Доступные вершины

                if (algoParams.availableVertexes.length == 0 ) {
                    break; //Нет вершин для перехода
                }

                let newVertex = findNewVertex(m); //Поиск вершины для перехода

                addVertexInWays(newVertex, j); //Добавить новую вершину в путь муравья
                refreshDistances(m, newVertex, j); //Обновить текущее пройденное расстояние
                addPheromones(newVertex);//Добавить феромон на ребре
                setVertexVisited(m); //Записать текущую вершину в посещенные

                if (newVertex == algoParams.endVertex) {
                    algoParams.endFound[j] = true;
                    break; //достигнута конечная вершина
                }

                m = newVertex;

            } while (true);

            evaporatePheromones(); //Испарить феромоны
       }

       saveBestSolution(i); //Сохранить лучшее решение
       clearWays(); //Очистить пути
       clearVisitedVertexes(); //Очистить посещенные вершины
       clearDistances(); //Очистить расстояния
       clearEndFound(); //Очистить флаги, что пути найдены
   }

   showBestWay();

}

function showBestWay() { //Отображение лучшего пути

    let resultElem;
    //Лучшее расстояние
    resultElem = document.querySelector('.result__best-distance');
    resultElem.textContent = 'Лучшее расстояние: ' + algoParams.bestDistance;

    //Лучший путь
    resultElem = document.querySelector('.result__best-way');
    resultElem.textContent = 'Лучший путь: ' + algoParams.bestWay;

    //Лучшая итерация
    resultElem = document.querySelector('.result__best-iteration');
    resultElem.textContent = 'Лучшая итерация: ' + algoParams.bestDistanceIteration;

    let field = document.querySelector('.algo-view');
    let cells = field.querySelectorAll('.js-view-container__cell');

    if (algoParams.bestWay.length != 0) {
        let bestWay = algoParams.bestWay.split('-');
        for (let i = 0; i < bestWay.length; i++) {
            cells[bestWay[i]].classList.add('js-view-container__way-cell');

            if (!cells[bestWay[i]].classList.contains('js-view-container__start-cell')) {//В простых ячейках отмечаем порядок прохождения пути
                if (!cells[bestWay[i]].classList.contains('js-view-container__end-cell')) {
                    cells[bestWay[i]].textContent = i;
                }
            }
    }


}
}

function formMatrixes() {

    mAdj.length = 0;
    mVisited.length = 0;
    mPheromones.length = 0;

    algoParams.matrixSize = algoParams.fieldSize * algoParams.fieldSize;
    for (let i = 0; i < algoParams.matrixSize; i++) {
        mAdj[i] = [];
        mVisited[i] = [];
        mPheromones[i] = [];
        for (let j = 0; j < algoParams.matrixSize; j++) {
            mAdj[i][j] = 0;
            mVisited[i][j] = 0;
            mPheromones[i][j] = 0;
        }
    }

    let k = 0;
    for (let i = 0; i < algoParams.matrixSize; i++) {
        k += 1;
        for (let j = k; j < algoParams.matrixSize; j++) {
            if (i == j) continue;
            if (j == i + 1) {
                if (j % algoParams.fieldSize != 0) {
                    mAdj[i][j] = 1;
                    mVisited[i][j] = 0;
                    mPheromones[i][j] = 1;

                    mAdj[j][i] = 1;
                    mVisited[j][i] = 0;
                    mPheromones[j][i] = algoParams.P;
                }
            }
            if (j == i + algoParams.fieldSize) {
                mAdj[i][j] = 1;
                mVisited[i][j] = 0;
                mPheromones[i][j] = algoParams.P;

                mAdj[j][i] = 1;
                mVisited[j][i] = 1;
                mPheromones[j][i] = algoParams.P;
            }
        }
    }

    //console.log(mAdj);
    // console.log(mVisited);
    // console.log(mPheromones);

}

function updateMAdjByWalls() { //Обновить матрицу смежности - стены непроходимы

    let field = document.querySelector('.algo-view');
    let cells = field.querySelectorAll('.js-view-container__cell');

    let k = 0;
    for (let elem of cells) {

        if (elem.classList.contains('js-view-container__wall-cell')) {
            for (let i = 0; i < algoParams.matrixSize; i++) {
                mAdj[i][k] = 0;
                mAdj[k][i] = 0;
            }
        }

        k++;

    }


}

function getAvailableVertexes(m) { //Поиск вершин для перехода

    let availableVertexes = [];
    for (let k = 0; k < algoParams.matrixSize; k++) {
        if (k == m) continue;
        if (mAdj[m][k] == 1 && mVisited[m][k] == 0) availableVertexes.push(k);
    }
    return availableVertexes;

}

function setVertexVisited(m) { //Установка указанной вершины посещенной

    for (let i = 0; i < algoParams.matrixSize; i++) {
        for (let j = 0; j < algoParams.matrixSize; j++) {

            if (i == j) continue;

            if (mAdj[i][j] == 1 && j == m) mVisited[i][j] = 1;

        }
    }

}

function findNewVertex(m) { //Поиск новой вершины для перехода
    let pSumm = 0;
    algoParams.pTransitions.length = 0;


    for (let k = 0; k < algoParams.availableVertexes.length; k++) { //Находим сумму вероятностей переходов
        let vertex = algoParams.availableVertexes[k];
        pSumm += Math.pow(mPheromones[m][vertex], algoParams.ALPHA) *
        Math.pow(1 / mAdj[m][vertex], algoParams.BETA);
    }

    for (let k = 0; k < algoParams.availableVertexes.length; k++) { //Находим вероятности переходов
        let vertex = algoParams.availableVertexes[k];
        algoParams.pTransitions[k] = Math.pow(mPheromones[m][vertex], algoParams.ALPHA) *
        Math.pow(1 / mAdj[m][vertex], algoParams.BETA) / pSumm;
    }

    let newVertex = 0;
    let rand = Math.random();
    pSumm = 0;
    for (let k = 0; k < algoParams.availableVertexes.length; k++) { //Находим вершину для перехода
        pSumm += algoParams.pTransitions[k];
        if (rand <= pSumm) {
            newVertex = algoParams.availableVertexes[k];
            return newVertex;
        }
    }
}

function addVertexInWays(newVertex, currentAntNumber) { //Добавление вершины в путь муравья

        algoParams.ways[currentAntNumber] += `-${newVertex}`;

}

function refreshDistances(currentVertex, newVertex, currentAntNumber) { //Обновление пройденного расстояния муравья

    algoParams.distances[currentAntNumber] += mAdj[currentVertex][newVertex];

}

function evaporatePheromones() { //Испарение феромонов

    for (let i = 0; i < algoParams.matrixSize; i++) {
        for (let j = 0; j < algoParams.matrixSize; j ++) {

            if (i == j) continue;

            if (mAdj[i][j] == 1) {
                mPheromones[i][j] *= algoParams.T;
                mPheromones[i][j] = Number(mPheromones[i][j].toFixed(3));
            }

        }
    }

}

function addPheromones(m) { //Добавление феромона

    for (let i = 0; i < algoParams.matrixSize; i++) {
        for (let j = 0; j < algoParams.matrixSize; j ++) {

            if (i == j) continue;

            if (j == m && mAdj[i][j] == 1) {
                mPheromones[i][j] += 1 / mAdj[i][j];
                mPheromones[i][j] = Number(mPheromones[i][j].toFixed(3));
                break;
            }

        }
    }

}

function clearVisitedVertexes() { //Очищение списка посещенных вершин

    for (let i = 0; i < algoParams.matrixSize; i++) {
        for (let j = 0; j < algoParams.matrixSize; j++) {

            if (i == j) continue;

            if (mAdj[i][j] == 1) mVisited[i][j] = 0;

        }
    }

}

function saveBestSolution(currentIteration) {

    for (let i = 0; i < algoParams.distances.length; i++) {
        if (algoParams.distances[i] < algoParams.bestDistance && algoParams.endFound[i] == true) {
            algoParams.bestDistance = algoParams.distances[i];
            algoParams.bestDistanceIteration = currentIteration;
            algoParams.bestWay = algoParams.ways[i];
        }
    }

}

function clearWays() { //Очистка списка пройденных путей

    algoParams.ways.length = 0;

}

function clearDistances() { //Очистка списка расстояний

    algoParams.distances.length = 0;

}

function clearEndFound() {

    algoParams.endFound.length = 0;

}