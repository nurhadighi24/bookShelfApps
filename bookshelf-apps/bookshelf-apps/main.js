const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function() {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event){
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook(){
  const judul = document.getElementById('inputBookTitle').value;
  const penulis = document.getElementById('inputBookAuthor').value;
  const tahun = document.getElementById('inputBookYear').value;
  const statusCheckBox = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, judul, penulis, tahun, statusCheckBox);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId(){
  return +new Date()
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}



document.addEventListener(RENDER_EVENT, function(){
  //console.log(books);
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  incompleteBookshelfList.innerHTML = '';

  const completeBookshelfList = document.getElementById('completeBookshelfList');
  completeBookshelfList.innerHTML = '';

  for(const bookItem of books){
    const bookElement = makeBook(bookItem);
    if(!bookItem.isCompleted){
      incompleteBookshelfList.append(bookElement);
    }else{
      completeBookshelfList.append(bookElement);
    }   
  }
});

function makeBook(bookObject){
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = 'Penulis: ' + bookObject.author;

  const textYear = document.createElement('p');
  textYear.innerText = 'Tahun: ' + bookObject.year;

  const btnContainer = document.createElement('div');
  btnContainer.classList.add('action');

  const btnDelete = document.createElement('button');
  btnDelete.classList.add('red');
  btnDelete.setAttribute('id', 'btn-delete');
  btnDelete.innerText = 'Hapus Buku';

  const articleContainer = document.createElement('article');
  articleContainer.classList.add('book_item');
  articleContainer.append(textTitle, textAuthor, textYear, btnContainer);
  articleContainer.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isCompleted){
    const btnUndo = document.createElement('button');
    btnUndo.classList.add('green');
    btnUndo.setAttribute('id', 'btn-undo');
    btnUndo.innerText = 'Belum selesai dibaca';

    btnUndo.addEventListener('click', function(){
      undoBookFromCompleted(bookObject.id);
    });
    btnDelete.addEventListener('click', function(){
      deleteBookFromShelf(bookObject.id);
    });

    btnContainer.append(btnUndo, btnDelete);
    articleContainer.append(btnContainer);
  }else{
    const btnDone = document.createElement('button');
    btnDone.classList.add('green');
    btnDone.setAttribute('id', 'btn-done');
    btnDone.innerText = 'Selesai dibaca';

    btnDone.addEventListener('click', function(){
      addBookToCompleted(bookObject.id);
    });
    btnDelete.addEventListener('click', function(){
      deleteBookFromShelf(bookObject.id);
    });

    btnContainer.append(btnDone, btnDelete);
    articleContainer.append(btnContainer);
  }

  return articleContainer;  
}

function addBookToCompleted (bookId){
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId){
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function deleteBookFromShelf(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId){
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex (bookId){
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function() {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

const checkbox = document.getElementById('inputBookIsComplete');
let check = false;

checkbox.addEventListener('change', function() {
  if (checkbox.checked) {
    check = true;
    
    document.querySelector('span').innerText = 'Selesai dibaca';
  }else {
    check = false;

    document.querySelector('span').innerText = 'Belum selesai dibaca';
  }
});

document.getElementById('searchBook').addEventListener('submit', function (event) {
    event.preventDefault();
    const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
    const bookList = document.querySelectorAll('.book_item > h3');
    for (const book of bookList) {
      if (book.innerText.toLowerCase().includes(searchBook)) {
        book.parentElement.parentElement.style.display = 'block';
      } else {
        book.parentElement.parentElement.style.display = 'none';
      }
    }
  });