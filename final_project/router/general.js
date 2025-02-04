const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//utility function
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
  //Write your code here
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

// Task 1: Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   //Write your code here
//   res.send(JSON.stringify(books,null,4));
// });

// Handle GET request for '/customer'
public_users.get('/', (req, res) => {
  res.send(JSON.stringify(books,null,4));
});

// Task 10:
// Get the book list available in the shop using async-await with Axios
public_users.get('/books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/customer');
    const books = response.data; // Assuming the books are returned in the response
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Task 2:Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Retrieve ISBN from request parameters
  const isbn = req.params.isbn;

  // console.log("Requested ISBN:", isbn); 
  console.log("Requested ISBN:", isbn);
 // Check if any book in the 'books' object has the provided 'isbn'
const foundBook = Object.values(books).find(book => book.isbn === isbn);

if (foundBook) {
    console.log("Book found:", foundBook);
    res.status(200).json(foundBook); // Send book details in response
} else {
    console.log("Book not found");
    res.status(404).json({ message: "Book not found" }); // Send error message
}
});

// Task 11:
// Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:5000/customer/isbn/${isbn}`);
    const foundBook = response.data;
    res.status(200).json(foundBook);
  } catch (error) {
    res.status(404).json({ message: "Book not found" });
  }
});

  
// Task 3: Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  //obtain the author from request parameters
  const author = req.params.author;

  //create array to store books by author
  const booksByAuthor = []; 

  //iterate all books
  for(const [key, book] of Object.entries(books)){
    if(book.author === author){
      booksByAuthor.push({id:key, ...book});
    }
  }

  // Task 12: Get book details based on author using async-await with Axios
public_users.get('/author-async/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get(`http://localhost:5000/customer/author/${author}`);
    const books = response.data;
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

  //check if any books were found for the provided author
  if(booksByAuthor.length > 0){
    res.status(200).json({"Books by this author":booksByAuthor});
  } else {
    res.status(404).json({message: "Book by this author not found"});
  }
});

//Task 4: Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  //Obtain the title from request parameters
  const title = req.params.title;

  const booksByTitle = Object.entries(books)
  .filter(([key, book]) => book.title === title)
  .map(([key, book]) => ({id: key, ...book}));

  //check if any books found for the provided title or not
  if(booksByTitle.length > 0) {
    res.status(200).json(booksByTitle);
  } else {
    res.status(404).json({message: "Books with this title not found"});
  }

});

// Task 13: Get book details based on title using async-await with Axios
public_users.get('/title-async/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const response = await axios.get(`http://localhost:5000/customer/title/${title}`);
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
 // Check if any book in the 'books' object has the provided 'isbn'
  const foundBook = Object.values(books).find(book => book.isbn === isbn);
  if (foundBook) {
      //if exist, retrive its reviews
    const reviews = foundBook.reviews;
    if(Object.keys(reviews).length > 0){
      res.status(200).json(reviews);
    } else {
      res.status(404).json({message: "NO reviews found for this book"})
    }
  } else {
    //if the book with the provided isbn doesnot exist
    res.status(404).json({message: "Book not found"});
  }
    
});

module.exports.general = public_users;