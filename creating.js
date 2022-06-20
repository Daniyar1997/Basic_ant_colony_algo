document.querySelector('.creating-create__button')
.onclick = createField;

document.querySelector('.creating-clear__button')
.onclick = clearField;

function createField() {
    let field = document.querySelector('.algo-view');
    if (field.children.length > 0) {
        comment('Поле уже создано', 'yellow');
        return;
    }

    let form = document.forms.algo_params;
    let fieldSize = form.elements.field_size.value;

    if (fieldSize == '' || fieldSize < 2 || fieldSize > 25) {
        comment('Неверный размер поля', 'red');
        return;
    }

    for (let i = 0; i < fieldSize; i++) {
        let flexContainer = document.createElement('div');
        flexContainer.className = 'js-view-container';
        field.append(flexContainer);
        for (let j = 0; j < fieldSize; j++) {
            let cell = document.createElement('div');
            cell.className = 'js-view-container__cell';
            flexContainer.append(cell);
        }
    }
    comment('Поле создано', 'green');
}

//Очистка рабочего поля
function clearField() {

    if (!document.querySelector('.algo-view').firstChild) {
        comment('Поле уже очищено', 'yellow');
        return;
    }

    while (document.querySelector('.algo-view').firstChild) {
        document.querySelector('.algo-view').firstChild.remove();
    }

    comment('Поле очищено', 'green');
}