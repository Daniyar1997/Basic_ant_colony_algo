function comment(text, color) {
    let commentElem = document.querySelector('.comment__text');
    commentElem.textContent = text;
    commentElem.style.backgroundColor = color;
    setTimeout(function() {
        commentElem.textContent = '';
        commentElem.style.backgroundColor = 'transparent';
    }, 2000);
}