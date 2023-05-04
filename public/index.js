/*var socket = io() - Ändrad 30/4 - 11.25

const btnSend = document.querySelector('#send')
console.log(btnSend)
btnSend.addEventListener('click', () => {
    const input = document.querySelector('#input')

    socket.emit('chat message', input.value)
})
*/

// NY kod
const searchForm = document.querySelector('#search-form')
const searchResultsContainer = document.getElementById('search-results')
const registerForm = document.querySelector('#register-form')

searchForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const searchTerm = document.getElementById('search-term').value

    console.log('Search term:', searchTerm)

    fetch(`http://localhost:4000/books?search=${searchTerm}`)
        .then((response) => response.json())
        .then((data) => {
            console.log('Search results:', data)

            if (!searchResultsContainer) {
                console.error('Search results container not found!')
                return
            }

            // Clearar result
            searchResultsContainer.innerHTML = ''

            function deleteBook(bookId) {
                fetch(`http://localhost:4000/books/${bookId}`, {
                    method: 'DELETE'
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log('Book deleted successfully:', data)

                        const bookElement = document.querySelector(
                            `[data-id="${bookId}"]`
                        )
                        if (bookElement) {
                            bookElement.remove()
                        } else {
                            console.error(
                                'Error deleting book: Book element not found'
                            )
                        }
                    })
                    .catch((error) =>
                        console.error('Error deleting book:', error)
                    )
            }

            function createEditForm(book) {
                const editForm = document.createElement('form')
                editForm.classList.add('edit-form')

                editForm.innerHTML = `
                  <label for="edit-title">Title:</label>
                  <input type="text" id="edit-title" name="edit-title" value="${book.title}"><br>

                  <label for="edit-author">Author:</label>
                  <input type="text" id="edit-author" name="edit-author" value="${book.author}"><br>

                  <label for="edit-year">Year:</label>
                  <input type="number" id="edit-year" name="edit-year" value="${book.year}"><br>

                  <label for="edit-genre">Genre:</label>
                  <input type="text" id="edit-genre" name="edit-genre" value="${book.genre}"><br>

                  <input type="submit" value="Save Changes">
                  <button type="button" class="cancel-edit">Cancel</button>
                `

                // Hanterar form för redigering av bok
                editForm.addEventListener('submit', (event) => {
                    event.preventDefault()

                    const updatedTitle =
                        editForm.querySelector('#edit-title').value
                    const updatedAuthor =
                        editForm.querySelector('#edit-author').value
                    const updatedYear =
                        editForm.querySelector('#edit-year').value
                    const updatedGenre =
                        editForm.querySelector('#edit-genre').value

                    fetch(`http://localhost:4000/books/${book.id}`, {
                        // Ändrad från fetch(`/books/${book.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: updatedTitle,
                            author: updatedAuthor,
                            year: updatedYear,
                            genre: updatedGenre
                        })
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            console.log('Book updated successfully:', data)

                            searchForm.dispatchEvent(new Event('submit'))
                        })
                        .catch((error) =>
                            console.error('Error updating book:', error)
                        )
                })

                // hanterar cancel knapp
                editForm
                    .querySelector('.cancel-edit')
                    .addEventListener('click', () => {
                        editForm.remove()
                    })

                return editForm
            }

            // funktion för borrow av bok
            function borrowBook(bookId) {
                fetch(`http://localhost:4000/books/${bookId}/borrow`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Error borrowing book')
                        }
                        return response.json()
                    })
                    .then(() => {

                    })
                    .catch((error) => {
                        console.error('Error borrowing book:', error)
                    })
            }

            // returnering av bok funktion
            function returnBook(bookId) {
                fetch(`http://localhost:4000/books/${bookId}/return`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Error returning book')
                        }
                        return response.json()
                    })
                    .then(() => {

                    })
                    .catch((error) => {
                        console.error('Error returning book:', error)
                    })
            } // NY

            // loopar genom böckerna och lägger till bland search
            for (const book of data) {
                const bookElement = document.createElement('div')
                const available = book.available ? 1 : 0
                const textColor = book.available ? 'green' : 'red'
                bookElement.innerHTML = `
                      <div class="book">
                        <div class="title"><h2>${book.title}</h2></div>
                        <div class="author"><p>Author: ${book.author}</p></div>
                        <div class="genre"><p>Genre: ${book.genre}</p></div>
                        <div class="year"><p>Year: ${book.year}</p></div>
                        <div class="available"><p><span style="color:${textColor}">Available:</span> <span style="color:${textColor}">${available}</span></p></div>
                        <button class="edit-button">Edit</button>
                      </div>

                    `

                // lägger till borrow knapp
                const borrowButton = document.createElement('button')
                borrowButton.textContent = book.available
                    ? 'Borrow book'
                    : 'Return book' // Byter text om tillgänglig eller ej
                borrowButton.classList.add('borrow-button')

                // borrow knapp och klick event
                borrowButton.addEventListener('click', () => {
                    if (book.available) {
                        borrowBook(book.id)
                    } else {
                        returnBook(book.id)
                    }

                    searchForm.dispatchEvent(new Event('submit'))
                })

                // lägger till en borrow knapp
                bookElement.appendChild(borrowButton)


                const editButton = document.createElement('button')
                editButton.textContent = 'Edit'
                editButton.classList.add('edit-button')
                editButton.addEventListener('click', () => {
                    const existingEditForm =
                        bookElement.querySelector('.edit-form')
                    if (!existingEditForm) {
                        const editForm = createEditForm(book)
                        bookElement.appendChild(editForm)
                    }
                })
                bookElement.appendChild(editButton)
                const deleteButton = document.createElement('button')
                deleteButton.textContent = 'Delete'
                deleteButton.dataset.id = book.id // sätter bokens ID som dataattribut
                deleteButton.classList.add('delete-button')
                deleteButton.addEventListener('click', () => {
                    deleteBook(book.id)
                })
                bookElement.appendChild(deleteButton) // addar delete knapp
                searchResultsContainer.appendChild(bookElement)
            }

            searchResultsContainer.classList.add('results-displayed')
        })
        .catch((error) => console.error('Error searching for books:', error))
})

registerForm.addEventListener('submit', (event) => {
    event.preventDefault() // förhindrar på vanligt sätt
    const author = document.getElementById('author').value
    const title = document.getElementById('title').value
    const genre = document.getElementById('genre').value
    const year = document.getElementById('year').value

    console.log('Registering new book:', { author, title, genre, year })


    fetch('http://localhost:4000/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, title, genre, year })
        /* authorName istället för author 30/4 - 17.01
        - Detta blev dock fel ska vara author */
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Book registered successfully:', data)
            registerForm.reset()
            const successMessage = document.createElement('p')
            successMessage.textContent = 'Book registered successfully!'
            successMessage.style.color = 'green'
            registerForm.appendChild(successMessage)

            // Addar till PostgreSQL databas
            const url = '/add_book'
            const requestData = { author, title, genre, year }

            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            })
                .then((response) => response.json())
                .then((data) => console.log(data))
                .catch((error) => console.error(error))
        })
        .catch((error) => console.error('Error registering book:', error))
})
