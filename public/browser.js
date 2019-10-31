function itemTemplate(item) {
  return `<li data-id="${item._id}" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
            <span class="item-text">${item.text}</span>
            <div>
              <button class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
              <button class="delete-me btn btn-danger btn-sm">Delete</button>
            </div>
          </li>`
}

// intial page load render
itemHTML = items.map((item) => {
  return itemTemplate(item)
}).join('')
document.getElementById('item-list').insertAdjacentHTML('beforeend', itemHTML)

// create feature
let createField = document.getElementById('create-field')

document.getElementById('create-form').addEventListener('submit', e => {
  e.preventDefault()
  if (createField.value != '') {
    axios.post('/create-item', {text: createField.value}).then((response) => {
      // create HTML for new value
      document.getElementById('item-list').insertAdjacentHTML('beforeend', itemTemplate(response.data))
      createField.value = ''
      createField.focus()
    }).catch(() => {
      console.log('Please try again later.')
    })
  }
})

document.addEventListener('click', (e) => {
  //delete feature
  if (e.target.classList.contains('delete-me')) {
    if (confirm('Do you really want to delete this item permanently?')) {
      axios.post('/delete-item', {id: e.target.parentElement.parentElement.getAttribute('data-id')}).then(() => {
        e.target.parentElement.parentElement.remove()
      }).catch(() => {
        console.log('Please try again later.')
      })
    }
  }
  //update feature
  if (e.target.classList.contains('edit-me')) {
    let userInput = prompt('Enter your desired new text', e.target.parentElement.parentElement.querySelector('.item-text').innerHTML)
    if (userInput) {
      axios.post('/update-item', {text: userInput,
        id: e.target.parentElement.parentElement.getAttribute('data-id')}).then(() => {
        e.target.parentElement.parentElement.querySelector('.item-text').innerHTML = userInput
      }).catch(() => {
        console.log('Please try again later.')
      })
    }
  }
})
