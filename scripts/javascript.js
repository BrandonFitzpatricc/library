const myLibrary = [];

function Book(title, author, numPages, hasRead) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.author = author;
    this.numPages = numPages;
    this.hasRead = hasRead;
}

Book.prototype.toggleReadStatus = function() {
    this.hasRead = !this.hasRead;
}

function addBookToLibrary(title, author, numPages, hasRead) {
    const newBook = new Book(title, author, numPages, hasRead);
    myLibrary.push(newBook);
}