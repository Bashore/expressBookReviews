const express = require('express');
const axios = require('axios').default;
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

//-----------------------------------------------------
// Example of getting book list using a promise
let bookPromise = new Promise((resolve,reject) => {
  // A timeout to fake a delay in database lookup
  setTimeout(() => {
    resolve(books)
  }, 1000)})

//-----------------------------------------------------
// Example of getting book list using async axios
// Note that I wasn't able to get axios to read a local
// file. So I created another local server to serve only
// the booksdb.js file on port 8080
async function getBooksAsync() {
  try {
    const theBooks = await axios.get("http://localhost:8080",{})
    console.log("got books");
    return theBooks.data;
  } catch (error) {
    console.log(error);
  }
}


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Use the axios method
  getBooksAsync().then(resp => {
    console.log("GOT BOOKS " + resp);
    res.send( JSON.stringify(resp) );
  })
  .catch(err => {
    res.send( "No books found" );
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  // Use a promise
  bookPromise.then((promise_books) =>
    res.send( JSON.stringify(promise_books[isbn]) ));
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {

  const author = req.params.author;
  let author_books = [];
  // Use a promise
  bookPromise.then((promise_books) => {
    for(let book in promise_books) {
      if (promise_books[book].author === author) {
        author_books.push(promise_books[book]);
      }
    };
    res.send(author_books);
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let ret_books = [];
  // Use a promise
  bookPromise.then((promise_books) => {
    for(let book in promise_books) {
      if (promise_books[book].title === title) {
        ret_books.push(promise_books[book]);
      }
    };
    res.send(ret_books);
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send( books[isbn].reviews);
});

module.exports.general = public_users;
