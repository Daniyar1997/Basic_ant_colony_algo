//Редактирование поля
let editMode = {
    on: false,
    activeType: {
        setWalls: false,
        setStart: false,
        setFinish: false,
    },
}
let startElem = null, endElem = null;

function nullActiveTypes() {
    let obj = editMode.activeType;
    for (let key in obj) {
        obj[key] = false;
    }
}

function checkReady() {

    if (field.children.length == 0) {
        comment('Поле не создано', 'red');
        return false;
    }

    if (!editMode.on) {
        comment('Включите режим редактирования', 'yellow');
        return false;
    }

    return true;

}

let field = document.querySelector('.algo-view');

//Режим редактирования
document.querySelector('.editing-edit__button')
.onclick = () => {
    if (field.children.length == 0) {
        comment('Поле не создано', 'red');
        return false;
    }
    editMode.on = true;
    document.querySelector('.algo-container')
    .style.cursor = 'crosshair';
    field.addEventListener('mousedown', onMouseDown);
    comment('Режим редактирования', 'green');
};

//Режим чтения
document.querySelector('.editing-accept__button')
.onclick = () => {
    if (field.children.length == 0) {
        comment('Поле не создано', 'red');
        return false;
    }
    editMode.on = false;
    document.querySelector('.algo-container')
    .style.cursor = 'default';
    field.removeEventListener('mousedown', onMouseDown);
    nullActiveTypes();
    comment('Режим чтения', 'green');
}

//Установить препятствия на поле
document.querySelector('.editing-set-walls__button')
.onclick = () => {
    if (!checkReady()) return;
    nullActiveTypes();
    editMode.activeType.setWalls = true;
};

//Установить начальную точку
document.querySelector('.editing-set-start__button')
.onclick = () => {
    if (!checkReady()) return;
    nullActiveTypes();
    editMode.activeType.setStart = true;
}

//Установить конечную точку
document.querySelector('.editing-set-end__button')
.onclick = () => {
    if (!checkReady()) return;
    nullActiveTypes();
    editMode.activeType.setFinish = true;
};

function onMouseDown(e) {

    e.preventDefault();

    if (e.target.classList.contains('js-view-container__cell') == false) return;

    //Установка стен
    if (editMode.activeType.setWalls &&
        e.target.className == 'js-view-container__cell' ) { //Стены можно ставить только на обычных ячейках

        e.target.classList.add('js-view-container__wall-cell');
        field.addEventListener('mousemove', onMouseMove);
        field.addEventListener('mouseup', onMouseUp, { once:true });

    }

    //Установка начальной точки
    if (editMode.activeType.setStart &&
        !e.target.classList.contains('js-view-container__end-cell')) { //Начальную точку нельзя ставить на конечную

        if (startElem) { //Очищаем предыдущую ячейку
            startElem.textContent = '';
            startElem.className = 'js-view-container__cell';
        }
        e.target.className = '';
        e.target.textContent = 'A';
        e.target.classList.add('js-view-container__cell','js-view-container__start-cell');
        startElem = e.target;

    }

    //Установка конечной точки
    if (editMode.activeType.setFinish &&
        !e.target.classList.contains('js-view-container__start-cell')) { //Конечную точку нельзя ставить на начальную

        if (endElem) { //Очищаем предыдущую ячейку
            endElem.textContent = '';
            endElem.className = 'js-view-container__cell';
        }
        e.target.className = '';
        e.target.textContent = 'B';
        e.target.classList.add('js-view-container__cell','js-view-container__end-cell');
        endElem = e.target;

    }
}

function onMouseMove(e) {
    let elem = document.elementFromPoint(event.clientX, event.clientY);
    if (elem.className == 'js-view-container__cell') {
        elem.classList.add('js-view-container__wall-cell');
    };
}

function onMouseUp(e) {
    field.removeEventListener('mousemove', onMouseMove)
}
