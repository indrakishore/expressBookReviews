const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validusers = users.filter((user)=>{
  return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
  return true;
  } else {
  return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60*60*60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

function generateIsbn() {
  let isbn = '978'; // The prefix for most ISBNs
  for (let i = 0; i < 9; i++) {
      isbn += Math.floor(Math.random() * 10); // Add 9 random digits
  }
  // Calculate the check digit
  let sum = 0;
  for (let i = 0; i < isbn.length; i++) {
      sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  isbn += checkDigit;
  return isbn;
}

// Route to add ISBN using book title
regd_users.post('/auth/add-isbn', (req, res) => {
  const { title } = req.body;

  // Check if the title is provided in the request body
  if (!title) {
      return res.status(400).json({ message: "Book title is required" });
  }

  // Search for the book title in the database
  const book = Object.values(books).find(book => book.title === title);

  // If the book is found, return its ISBN
  if (book) {
      const isbn = generateIsbn(); // Function to generate ISBN

      // Update the book with the generated ISBN
      book.isbn = isbn;

      return res.status(200).json({ isbn: isbn });
  } else {
      // If the book is not found, return an error message
      return res.status(404).json({ message: "Book not found" });
  }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Assuming the username is stored in the session
  const review = req.body.review;

  // Check if the user is authenticated
  if (!username) {
      return res.status(401).json({ message: "User not authenticated." });
  }

  // Check if review text is provided
  if (!review) {
      return res.status(400).json({ message: "Review text is required." });
  }

  // Check if the book exists in the database
  const foundBook = Object.values(books).find(book => book.isbn === isbn);
  if (!foundBook) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Ensure that the book has a reviews property and initialize it if it doesn't exist
  foundBook.reviews = foundBook.reviews || {};

  // Add or modify the review
  foundBook.reviews[username] = review;

  return res.status(200).json({ message: "Review added/modified successfully." });
});





//delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Corrected

  // Check if the user is logged in
  if (!username) {
      return res.status(401).json({ message: "Unauthorized: You need to log in to delete a review" });
  }

  // Check if any book in the 'books' object has the provided 'isbn'
  const foundBook = Object.values(books).find(book => book.isbn === isbn);
  if (foundBook) {
      // Check if the book has reviews
      if (foundBook.reviews) {
          // Check if the user has a review for this book
          if (foundBook.reviews.hasOwnProperty(username)) {
              // Delete the user's review for this book
              delete foundBook.reviews[username];
              return res.status(200).json({ message: "Review deleted successfully" });
          } else {
              return res.status(404).json({ message: "No review found for this user and book combination" });
          }
      } else {
          return res.status(404).json({ message: "No reviews found for this book" });
      }
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
