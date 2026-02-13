const myLibrary = [];

// Storing the width of each book in an array provides a convenient way to access the current 
// widest and second widest books, which allows for the book grid columns to be resized to
// the second widest book's width when the first widest book is removed.
const bookWidths = [];

const root = document.querySelector(":root");
const minGridColumnSize = +getComputedStyle(root)
                          .getPropertyValue("--grid-column-size")
                          .slice(0, -2);
let currentGridColumnSize = minGridColumnSize; 

class Book {
    #id;
    #title;
    #author;
    #pages;
    #hasRead;

    constructor(title, author, pages, hasRead) {
        this.#id = crypto.randomUUID();
        this.#title = title;
        this.#author = author;
        this.#pages = pages;
        this.#hasRead = hasRead;
    }

    display() {
        const bookContainer = document.querySelector("#book-container");

        const book = document.createElement("div");
        book.className = "book";
        book.dataset.id = this.#id;

        const title = document.createElement("div");
        title.className = "title"
        title.textContent = this.#title;

        const author = document.createElement("div");
        author.className = "author";
        author.textContent = this.#author;

        const pages = document.createElement("div");
        pages.className = "pages";
        pages.textContent = `${this.#pages} pages`;

        const readStatusBtn = document.createElement("button");
        // The "has-read" and "has-not-read" classes each set corresponding background images
        // for the button, which are toggled accordingly.
        readStatusBtn.className = `book-btn read-status-btn ${this.#hasRead ? "has-read" : "has-not-read"}`;
        // The callback function must be bound to "this" in the current context.
        // Otherwise, when the function is called, the context will change and
        // "this" will be set to the button that triggered the function rather than 
        // the object that the function originated from.
        readStatusBtn.addEventListener("click", this.toggleReadStatus.bind(this));

        const removeBtn = document.createElement("button");
        removeBtn.className = "book-btn remove-btn";

        removeBtn.addEventListener("click", (event) => {
            const removedBookDisplay = event.target.parentNode;
            bookContainer.removeChild(removedBookDisplay);

            const removedBookObj = myLibrary.splice(myLibrary.findIndex
                                            (book => book.#id === removedBookDisplay.dataset.id), 1)[0];

            // Each entry in the book widths array is an object containing both the width of a book,
            // and the object associated with that book. Without this association, it would not
            // be possible to retrieve the width of individual books.
            const removedBookWidth = bookWidths
                                    .find((bookWidth) => bookWidth.book === removedBookObj)
                                    .value;

            // When the widest book is removed, the grid columns will be resized to the width of
            // the second widest book. This ensures that books will not take up more space
            // than they need to while still maintaining uniformity, making for a more natural
            // appearance. 
            const modifyingGridColumnSize = removedBookWidth === currentGridColumnSize && 
                                            currentGridColumnSize > minGridColumnSize;
            if(modifyingGridColumnSize) {
                // Sorting the book widths array provides both a convenient way to remove 
                // the largest width, and a convenient way to retrieve the width of the 
                // second widest book.
                bookWidths.sort((bookWidth1, bookWidth2) => bookWidth1.value - bookWidth2.value);
                bookWidths.pop();
                currentGridColumnSize = bookWidths.at(-1).value;
                root.style.setProperty("--grid-column-size", currentGridColumnSize + "px");
            } else {
                bookWidths.splice(bookWidths.findIndex
                        (bookWidth => bookWidth.value === removedBookWidth), 1);
            }
        });

        book.append(title, author, pages, readStatusBtn, removeBtn);

        bookContainer.appendChild(book);

        // If the intrinsic width of the book is larger than the current grid column size, 
        // then the grid columns will be resized to that width. This is to ensure that
        // there is no content overflow while maintaining uniform grid column sizing.
        const bookWidth = +getComputedStyle(book).getPropertyValue("width").slice(0, -2);

        if(bookWidth > currentGridColumnSize) {
            currentGridColumnSize = bookWidth;
            root.style.setProperty("--grid-column-size", currentGridColumnSize + "px");
        }

        bookWidths.push(new BookWidth(this, bookWidth));

        // Books are initially absolutely positioned so that they ignore the grid content flow
        // and maintain their intrinsic width, which is needed for the above calculations. 
        // Once this width has been obtained and the new grid column size (if any) has been 
        // calculated, this class will change its positioning to relative so that it is resized
        // and slotted into the grid accordingly.
        book.className += " relatively-positioned";
    }

    toggleReadStatus(event) {
        this.#hasRead = !this.#hasRead;
        // The "has-read" and "has-not-read" classes each set corresponding background images
        // for the button, which are toggled accordingly.
        event.target.className = `book-btn read-status-btn ${this.hasRead ? "has-read" : "has-not-read"}`;
    }
}

function BookWidth(book, value) {
    this.book = book;
    this.value = value; 
}

const addBookDialog = document.querySelector("#add-book-dialog");
const addBookForm = document.querySelector("#add-book-form");
const bookFormBtn = document.querySelector("#book-form-btn");
const validationFailedMessage = document.querySelector("#validation-failed-message");

bookFormBtn.addEventListener("click", () => {
    addBookForm.reset();
    validationFailedMessage.className = "validation-failed-message hidden";
    addBookDialog.showModal();
});

const submitBookBtn = document.querySelector("#submit-book-btn");
submitBookBtn.addEventListener("click", (event) => {
    let title = document.querySelector("#title").value;
    let author = document.querySelector("#author").value;
    let pages = document.querySelector("#pages").value;
    let hasRead = document.querySelector("#read-status").checked;

    // Validation checks: all fields should be filled out, author name can only contain
    // letters/single spaces, and the max page number limit is 9999.
    const allFieldsFilledOut = title && author && pages;
    const validAuthor = /^([a-zA-Z]+\s)*[a-zA-Z]+$/.test(author);
    if (pages > 9999) pages = 9999;
    
    if(allFieldsFilledOut && validAuthor) {
        // Capitalize both the title and the author, if they aren't capitalized already.
        title = title.charAt(0).toUpperCase() + title.slice(1);

        author = author
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

        addBookToLibrary(title, author, pages, hasRead);
        myLibrary.at(-1).display();  

        addBookDialog.close();
    } else {
        validationFailedMessage.textContent = !allFieldsFilledOut ?
                                              "Please fill out missing fields" :
                                              "Author name can only include letters and single spaces";

        validationFailedMessage.className = "validation-failed-message visible";
    }
});

const closeFormBtn = document.querySelector("#close-form-btn");
closeFormBtn.addEventListener("click", () => addBookDialog.close());

function addBookToLibrary(title, author, pages, hasRead) {
    const newBook = new Book(title, author, pages, hasRead);
    myLibrary.push(newBook);
}

addBookToLibrary("No Longer Human", "Osamu Dazai", 176, true);
addBookToLibrary("Playing for the Commandant", "Suzy Zail", 249, false);
addBookToLibrary("I'm Glad My Mom Died", "Jennette McCurdy", 320, true);
addBookToLibrary("Franny and Zooey", "JD Salinger", 201, false);
addBookToLibrary("1984", "George Orwell", 368, true);
addBookToLibrary("The Bell Jar", "Sylvia Plath", 294, false);
addBookToLibrary("Death of a Salesman", "Arthur Miller", 144, false);
addBookToLibrary("American Psycho", "Bret Easton Ellis", 399, false);
addBookToLibrary("Flowers for Algernon", "Daniel Keyes", 311, true);
addBookToLibrary("Life of the Party", "Olivia Gatwood", 176, true);

myLibrary.forEach(book => book.display());