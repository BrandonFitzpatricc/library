const myLibrary = [];

for(let i = 0; i < 12; i++) {
    addBookToLibrary("Title", "Author", `${360 + i} pages`, true)
}

function Book(title, author, pages, hasRead) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.hasRead = hasRead;
}

Book.prototype.display = function() {
    const bookContainer = document.querySelector("#book-container");

    const book = document.createElement("div");
    book.className = "book";
    book.dataset.id = this.id;

    const title = document.createElement("div");
    title.className = "title"
    title.textContent = this.title;

    const author = document.createElement("div");
    author.className = "author";
    author.textContent = this.author;

    const pages = document.createElement("div");
    pages.className = "pages";
    pages.textContent = this.pages;

    const readStatusBtn = document.createElement("button");
    // The "has-read" and "has-not-read" classes each set corresponding background images
    // for the button, which are toggled accordingly
    readStatusBtn.className = `book-btn read-status-btn ${this.hasRead ? "has-read" : "has-not-read"}`;
    // The callback function must be bound to "this" in the current context.
    // Otherwise, when the function is called, the context will change and
    // "this" will be set to the button that triggered the function rather than 
    // the object that the function originated from.
    readStatusBtn.addEventListener("click", this.toggleReadStatus.bind(this));

    const removeBtn = document.createElement("button");
    removeBtn.className = "book-btn remove-btn";
    removeBtn.addEventListener("click", (event) => {
        const bookBeingRemoved = event.target.parentNode;
        bookContainer.removeChild(bookBeingRemoved);
        myLibrary.splice(myLibrary.findIndex
                        ((book) => book.id === bookBeingRemoved.dataset.id), 1);
    });

    book.append(title, author, pages, readStatusBtn, removeBtn);

    bookContainer.appendChild(book);
}

Book.prototype.toggleReadStatus = function(event) {
    this.hasRead = !this.hasRead;
    // The "has-read" and "has-not-read" classes each set corresponding background images
    // for the button, which are toggled accordingly
    event.target.className = `book-btn read-status-btn ${this.hasRead ? "has-read" : "has-not-read"}`;
}

function addBookToLibrary(title, author, pages, hasRead) {
    const newBook = new Book(title, author, pages, hasRead);
    myLibrary.push(newBook);
}

myLibrary.forEach(book => book.display());