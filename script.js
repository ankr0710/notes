
const list = document.getElementById('list') // Контейнер для списка заметок
const search = document.getElementById('search') // Поле поиска
const btnSearch = document.getElementById('search-btn') // Кнопка поиска
const btnNote = document.getElementById('btn-note') // Кнопка создания новой заметки
const btnModalClose = document.getElementById('modal_close') // Кнопка закрытия модального окна
const menu = document.getElementById('menu') // Меню с тегами/категориями
const overlay = document.getElementById("overlay") // Затемняющий фон модального окна
const modalTitle = document.getElementById("modal__input") // Поле ввода заголовка в модальном окне
const modalSelect = document.getElementById("modal__select") // Выпадающий список тегов в модальном окне
const modalSaveBtn = document.getElementById("modal-save") // Кнопка сохранения в модальном окне
const modalForm = document.getElementById('modal-form') // Форма модального окна

// Переменные состояния приложения
let btnDel = null
let activeTag = 1 // ID активного тега (по умолчанию "Все")
let editingItem = null // Редактируемая заметка (null если создается новая)
let maxId = null // Максимальный ID заметки для генерации новых ID

const notes = initDate()
// Массив доступных тегов/категорий
const tags = [
    {
        id: 1,
        title: 'Все'   
    },
    {
        id: 2,
        title: 'Идея'    
    },
    {
        id: 3,
        title: 'Личное'    
    },
    {
        id: 4,
        title: 'Работа'    
    }]

// Инициализация заметок из localStorage

// Обработчик нажатия Enter в поле поиска
search.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); // Предотвращаем стандартное действие (отправку формы)
        btnSearch.click(); // Имитируем клик по кнопке поиска
    }
});

// Функция поиска максимального ID среди заметок 
function getMaxId(){
    let max = 0
    for (let i of notes){ // Перебираем все заметки
        if (i.id > max){
            max = i.id // Обновляем максимальное значение
        }
    }
    return max // Возвращаем максимальный ID
}

// Функция инициализации данных из localStorage
function initDate(){
    const rawData = localStorage.getItem('data') // Получаем данные из localStorage
    if (rawData === null){ // Если данных нет
        return [] // Возвращаем пустой массив
    }
    return JSON.parse(rawData) // Парсим JSON и возвращаем массив заметок
}

// Функция сохранения заметок в localStorage
function saveToLocal(){
    localStorage.setItem('data', JSON.stringify(notes)) // Сохраняем массив как JSON строку 
}

// Функция создания элемента тега для меню
function createTag(tag){
    const element = document.createElement('li') // Создаем элемент списка
    element.classList.add('list-item') // Добавляем CSS класс
    element.innerText = tag.title // Устанавливаем текст из названия тега
    return element // Возвращаем созданный элемент
}

// Функция создания элемента заметки для списка
function createNote(note){
    const element = document.createElement('div') // Создаем контейнер для заметки
    element.classList.add("list_otch") // Добавляем CSS класс

    // Создаем элемент для заголовка заметки
    const title = document.createElement('span')
    title.innerText = note.title
    title.classList.add("list_otch-title")

    // Создаем элемент для даты
    const date = document.createElement('span')
    date.classList.add("list_otch-date")
    date.innerText = new Date().toDateString() // Текущая дата в строковом формате

    // Создаем элемент для тега
    const tag = document.createElement('span')
    tag.classList.add("list_otch-tag")
    // Находим название тега по ID и устанавливаем его
    tag.innerText = tags.find((i) => i.id === note.tag).title
    
    // Добавляем все элементы в контейнер заметки
    element.appendChild(title)
    element.appendChild(date)
    element.appendChild(tag)
    
    // Добавляем обработчик клика для редактирования заметки
    element.addEventListener('click',()=>{
        editingItem = note // Устанавливаем редактируемую заметку
        openModal() // Открываем модальное окно
    })
    return element // Возвращаем созданный элемент
}

// Функция фильтрации заметок по поисковому запросу
function getNotes(searchValue){
    const filteredNotes = notes.filter((i) => {
        return i.title.startsWith(searchValue) // Фильтруем заметки, которые начинаются с searchValue
    })
    return filteredNotes // Возвращаем отфильтрованный массив
}

// Функция рендеринга меню тегов
function renderMenu(){
    for(let tag of tags){ // Перебираем все теги
        const element = createTag(tag) // Создаем элемент тега
        element.addEventListener("click",() =>{ // Добавляем обработчик клика
            activeTag = tag.id // Устанавливаем активный тег
            render() // Перерисовываем список заметок
        })
        menu.appendChild(element) // Добавляем элемент в меню
    }
}

// Основная функция рендеринга списка заметок
function render(){
    list.innerHTML = '' // Очищаем контейнер списка
    
    let filtered = getNotes(search.value) // Получаем отфильтрованные по поиску заметки

    // Дополнительная фильтрация по активному тегу
    if (activeTag !== 1){ // Если выбран не тег "Все"
        filtered = filtered.filter(i => i.tag === activeTag) // Фильтруем по тегу
    }

    // Проверка на пустой результат
    if(filtered.length === 0){
        list.innerText = 'По вашему запросу ничего не найдено' // Сообщение об отсутствии результатов
        return // Прерываем выполнение функции
    }

    // Рендеринг найденных заметок
    for (let i of filtered){
        const element = createNote(i) // Создаем элемент заметки
        list.appendChild(element) // Добавляем в список
    }
}

// Функция удаления заметки
function onDelete(id){
    const idx = notes.findIndex(i => i.id === id) // Находим индекс заметки
    notes.splice(idx, 1) // Удаляем заметку из массива
    saveToLocal()
    closeModal() // Закрываем модальное окно
    render() // Перерисовываем список
}

// Функция открытия модального окна
function openModal(){
    overlay.classList.add("overlay_open") // Показываем затемняющий фон
    modalTitle.value = editingItem.title // Заполняем поле заголовка
    
    // Заполняем выпадающий список тегами
    for (let tag of tags){
        const option = document.createElement('option') // Создаем option
        option.value = tag.id // Устанавливаем значение
        option.innerText = tag.title // Устанавливаем текст
        modalSelect.appendChild(option) // Добавляем в select
    }
    
    // Если редактируем существующую заметку - добавляем кнопку удаления
    if (editingItem.id){
        btnDel = document.createElement('button') // Создаем кнопку
        btnDel.classList.add('modal__btn-save') // Добавляем CSS класс
        btnDel.style.background = 'red' // Устанавливаем красный фон
        btnDel.innerText = 'Удалить' // Текст кнопки
        btnDel.addEventListener('click',(e) => { // Обработчик клика
            e.preventDefault() // Предотвращаем отправку формы
            onDelete(editingItem.id) // Вызываем функцию удаления
        })
        modalForm.appendChild(btnDel) // Добавляем кнопку в форму
        
    }
}

// Функция закрытия модального окна
function closeModal(){
    overlay.classList.toggle("overlay_open") // Скрываем затемняющий фон
    modalSelect.innerHTML = "" // Очищаем выпадающий список
    editingItem = null // Сбрасываем редактируемую заметку
    if(btnDel !== null) {

        btnDel.remove() // Удаляем заметку
    }
}

// Функция сохранения заметки (создание или обновление)
function onSave(){
    if(!editingItem){ // Если нет редактируемой заметки
        closeModal() // Закрываем модальное окно
        return // Прерываем выполнение
    }
    
    // Создание новой заметки
    if(!editingItem.id){
        notes.unshift({ // Добавляем новую заметку в начало массива
            id: ++maxId, // Генерируем новый ID
            title: modalTitle.value, // Берем заголовок из поля ввода
            tag: +modalSelect.value, // Берем тег из выпадающего списка
            updateAt: editingItem.updateAt // Используем существующую дату
        })
    }
    
    // Обновление существующей заметки
    if (editingItem.id){
        const item = notes.find(i => i.id === editingItem.id) // Находим заметку
        item.title = modalTitle.value // Обновляем заголовок
        item.tag = modalSelect.value // Обновляем тег
        item.updateAt = new Date().toDateString()
    }
    saveToLocal()
    render()
    closeModal()
}




// Основная функция инициализации приложения
function init(){
    maxId = getMaxId() // Устанавливаем максимальный ID
    renderMenu() // Рендерим меню тегов
    render() // Рендерим список заметок
    
    // Обработчик клика по кнопке поиска
    btnSearch.addEventListener('click', render)
    
    // Обработчик клика по кнопке создания заметки
    btnNote.addEventListener('click',()=>{
        editingItem = { // Создаем объект для новой заметки
            id: null,
            title: null,
            tag: null,
            updateAt: new Date().toDateString() // Текущая дата
        }
        openModal() // Открываем модальное окно
    })
    
    // Обработчик клика по кнопке закрытия модального окна
    btnModalClose.addEventListener('click', closeModal) // Закрываем модальное окно
    
    // Обработчик клика по кнопке сохранения в модальном окне
    modalSaveBtn.addEventListener('click',(e)=>{
        e.preventDefault() // Предотвращаем отправку формы
        onSave() // Вызываем функцию сохранения
    })
}

// Запуск приложения
init()