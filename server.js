let express = require('express')
let mongodb = require('mongodb')
const dotenv = require('dotenv')
let sanitizeHTML = require('sanitize-html')

dotenv.config()

let app = express()
let db

let port = process.env.PORT

if (port == null || port == '') {
  port = 3000
}

app.use(express.static('public'))

let connnectionString = 'mongodb+srv://' + process.env.MONGODB_USERNAME +
  ':' + process.env.MONGODB_PASSWORD +
  '@' + process.env.MONGODB_CLUSTER + '-rej5u.mongodb.net/' +
  process.env.MONGODB_DATABASE + '?retryWrites=true&w=majority'

mongodb.connect(connnectionString, {useNewUrlParser: true}, (err, client) => {
  db = client.db()
  app.listen(port)
})

app.use(express.json())

app.use(express.urlencoded({
  extended: false
}))

function passwordProtected(req, res, next) {
  res.set('WWW-Authenticate', 'Basic realm="Simple ToDo App"')
  console.log(req.headers.authorization)
  //username: learn, password: javascript
  if (req.headers.authorization == 'Basic bGVhcm46amF2YXNjcmlwdA==') {
    next()
  } else {
    res.status(401).send('Authentication required')
  }
}

// app.use(passwordProtected)

app.get('/', (req, res) => {
  db.collection('items').find().toArray((err, items) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple To-Do App</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
        <link href="https://fonts.googleapis.com/css?family=Fira+Sans&display=swap" rel="stylesheet">
      </head>
      <body style="font-family: 'Fira Sans', sans-serif;">
        <div class="container">
          <h1 class="display-4 text-center py-1">To-Do App</h1>

          <div class="jumbotron p-3 shadow-sm">
            <form id="create-form" action="create-item" method="POST">
              <div class="d-flex align-items-center">
                <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                <button class="btn btn-primary">Add New Item</button>
              </div>
            </form>
          </div>

          <ul id="item-list" class="list-group pb-5">
          </ul>

        </div>

        <script>
          let items = ${JSON.stringify(items)}
        </script>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <script src="/browser.js"></script>

      </body>

      </html>
    `)
  })
})

app.post('/create-item', (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {}
  })
  db.collection('items').insertOne({
    text: safeText
  }, (err, info) => {
    res.json(info.ops[0])
  })
})

app.post('/update-item', (req, res) => {
  let safeText = sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: {}
  })
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)},
    {$set: {text: safeText}}, () => {
    res.send('Successfully updated')
  })
})

app.post('/delete-item', (req, res) => {
  db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, () => {
    res.send('Successfully deleted')
  })
})
