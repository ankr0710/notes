document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menu_button');
    const overlay = document.getElementById('overlay');
    const modalClose = document.getElementById('modal_close');
    const modalForm = document.getElementById('modal-form');
    const modalInput = document.getElementById('modal__input');
    const modalSelect = document.getElementById('modal__select');
    const modalSave = document.getElementById('modal-save');
    const modalDelete = document.getElementById('modal-delete');
    const list = document.getElementById('list');
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const menu = document.getElementById('menu');

    // Массив заметок
    let notes = [];

    // Текущая редактируемая заметка
    let currentNoteId = null;

    // Базовые теги (всегда отображаются, даже если заметок нет)
    const BASE_TAGS = ['Идеи', 'Личное', 'Работа', 'Список покупок'];

    // Показать модальное окно
    function showModal(note = null) {
        overlay.style.display = 'flex';
        if (note) {
            modalInput.value = note.title;
            modalSelect.value = note.tag;
            currentNoteId = note.id;
            modalDelete.style.display = 'block';
        } else {
            modalForm.reset();
            currentNoteId = null;
            modalDelete.style.display = 'none';
        }
        modalInput.focus();
    }

    // Закрыть модальное окно
    function hideModal() {
        overlay.style.display = 'none';
        modalForm.reset();
        currentNoteId = null;
        modalDelete.style.display = 'none';
    }

    // Создать заметку
    function createNote(title, tag) {
        const note = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            title: title,
            tag: tag,
            date: new Date().toLocaleDateString('ru-RU')
        };
        notes.push(note);
        renderNotes();
        renderTags();
    }

    // Обновить заметку
    function updateNote(id, title, tag) {
        const note = notes.find(n => n.id === id);
        if (note) {
            note.title = title;
            note.tag = tag;
            renderNotes();
            renderTags();
        }
    }

    // Удалить заметку
    function deleteNote(id) {
        notes = notes.filter(n => n.id !== id);
        renderNotes();
        renderTags();
        hideModal();
    }

    // Рендеринг заметок
    function renderNotes(filter = '') {
        list.innerHTML = '';
        const filteredNotes = notes.filter(note => {
            const searchText = filter.toLowerCase();
            return note.title.toLowerCase().includes(searchText) ||
                   note.tag.toLowerCase().includes(searchText);
        });

        filteredNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'list__report';
            noteElement.dataset.id = note.id;

            noteElement.innerHTML = `
                <div class="list__report-title"><b>${note.title}</b></div>
                <div class="list__report-date">${note.date}</div>
                <div class="list__report-tag">${note.tag}</div>
                <button class="list__report-edit" data-id="${note.id}">Редактировать</button>
            `;

            list.appendChild(noteElement);
        });

        // Обработчики редактирования
        document.querySelectorAll('.list__report-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                const note = notes.find(n => n.id === id);
                showModal(note);
            });
        });
    }

    // Рендеринг тегов (всегда: «Все» + базовые теги + уникальные из заметок)
    function renderTags() {
        // Очищаем контейнер
        menu.innerHTML = '';

        // Добавляем тег «Все» (всегда первый)
        const allTag = document.createElement('li');
        allTag.className = 'list__tags';
        allTag.textContent = 'Все';
        allTag.dataset.filter = 'all';
        menu.appendChild(allTag);

        // Собираем все теги: базовые + из заметок
        const tagsFromNotes = [...new Set(notes.map(n => n.tag))];
        const allTags = [...new Set([...BASE_TAGS, ...tagsFromNotes])];

        // Добавляем остальные теги
        allTags.forEach(tag => {
            const li = document.createElement('li');
            li.className = 'list__tags';
            li.textContent = tag;
            li.dataset.filter = tag;
            menu.appendChild(li);
        });

        // Обработчики кликов по тегам
        document.querySelectorAll('.list__tags').forEach(tagEl => {
            tagEl.addEventListener('click', function() {
                const filter = this.dataset.filter;
                if (filter === 'all') {
                    renderNotes(searchInput.value);
                } else {
                    renderNotes(filter);
                }
            });
        });
    }

    // Обработчики событий
    menuButton.addEventListener('click', () => showModal());
    modalClose.addEventListener('click', hideModal);

    modalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = modalInput.value.trim();
        const tag = modalSelect.value;

        if (!title) return;

        if (currentNoteId) {
            updateNote(currentNoteId, title, tag);
        } else {
            createNote(title, tag);
        }
        hideModal();
    });

    modalDelete.addEventListener('click', () => deleteNote(currentNoteId));

    // Поиск только по кнопке «Найти»
    searchBtn.addEventListener('click', () => {
        renderNotes(searchInput.value); // Запускаем рендеринг с фильтром из поля поиска
    });

    // УДАЛЕНО: поиск при вводе текста
    // searchInput.addEventListener('input', () => renderNotes(searchInput.value));

    // Инициализация
    renderNotes();
    renderTags();
});