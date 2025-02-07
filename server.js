const express = require("express");
const cors = require("cors");
const validator = require("email-validator");

const app = express();

app.use(express.json());
app.use(cors());

//Use this array as your (in-memory) data store.
const bookings = require("./bookings.json");
const moment = require("moment");

app.get("/", function (request, response) {
  response.send("Hotel booking server.  Ask for /bookings, etc.");
});

app.get("/bookings", (req, res) => {
  res.json(bookings);
});

app.get("/bookings/search", (req, res) => {
  console.log(req.query.date);

  if (req.query.date !== undefined) {
    const dateToFind = moment(req.query.date);
    console.log(dateToFind);
    const matchingDates = bookings.filter(
      (item) =>
        moment(item.checkInDate) <= dateToFind &&
        moment(item.checkOutDate) >= dateToFind
    );
    res.json(matchingDates);
  }
  if (req.query.term !== undefined) {
    const searchTerm = req.query.term.toUpperCase();
    console.log(searchTerm);
    const matchingTerms = bookings.filter((item) => {
      return (
        item.email.toUpperCase().includes(searchTerm) ||
        item.firstName.toUpperCase().includes(searchTerm) ||
        item.surname.toUpperCase().includes(searchTerm)
      );
    });
    res.json(matchingTerms);
  }
  //  moment(req.query.time);
  //const date = new Date("2019-05-06");
});

app.get("/bookings/:id", (req, res) => {
  const id = req.params.id;
  const requestedBooking = bookings.find((item) => item.id === Number(id));
  if (requestedBooking !== undefined) {
    res.json(requestedBooking);
  } else {
    res.status(404).json(`No booking with ID: ${id}.`);
  }
});

app.post("/bookings", (req, res) => {
  const { title, firstName, surname, email, checkInDate, checkOutDate } =
    req.body;
  const newBooking = {
    id: bookings.length,
    title,
    firstName,
    surname,
    email,
    roomId: bookings.length + 2,
    checkInDate,
    checkOutDate,
  };
  if (
    newBooking.title ||
    newBooking.firstName ||
    newBooking.surname ||
    newBooking.email ||
    newBooking.checkInDate ||
    newBooking.checkOutDate === undefined
  ) {
    res.json("Please fill all fields.");
  }
  if (!validator.validate(newBooking.email)) {
    res.status(400).json({ message: "Please enter valid email address." });
  }
  if (
    (moment(newBooking.checkInDate).diff(newBooking.checkOutDate), "day" < 0)
  ) {
    res
      .status(400)
      .json({ message: "Please enter valid check in and checkout dates." });
  } else {
    bookings.push(newBooking);
    res.json("Booking Added");
  }
});
console.log();
//////////does not modify the data just filters it//////

// app.delete("/bookings:id", (req, res) => {
//   const id=Number(req.params.id)
//   const requestedBooking=bookings.find((item)=> item.id===id)
//   if(requestedBooking){
//     const remainingBookings= bookings.filter((item)=> item.id!==Number(id))
//     res.json({message: `Booking with ID: ${id} deleted.`, bookings: remainingBookings})
// }
// else{
//     res.status(404).json({message: `Booking with ID: ${id} not found.`})
// }
// });

app.delete("/bookings/:id", (req, res) => {
  const id = Number(req.params.id);
  const requestedBooking = bookings.find((item) => item.id === id);
  if (requestedBooking) {
    const deletedBookingIndex = bookings.findIndex((item) => item.id === id);
    bookings.splice(deletedBookingIndex, 1);
    res.json({
      message: `Booking with ID: ${id} deleted.`,
      bookings: bookings,
    });
  } else {
    res.status(404).json({ message: `Booking with ID: ${id} not found.` });
  }
});

const listener = app.listen(3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
