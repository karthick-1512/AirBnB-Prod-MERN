import axios from "axios";
import { differenceInCalendarDays } from "date-fns";
import { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext.jsx";

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [redirect, setRedirect] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    axios.get(`/bookings?placeId=${place._id}`).then(({ data }) => {
      setBookings(data);
      const allDates = [];

      data.forEach((booking) => {
        const start = new Date(booking.checkIn);
        const end = new Date(booking.checkOut);
        for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
          allDates.push(new Date(d));
        }
      });

      setBookedDates(allDates);
    });
  }, [place._id]);

  const numberOfNights =
    checkIn && checkOut ? differenceInCalendarDays(checkOut, checkIn) : 0;

  function isOverlapping(newStart, newEnd) {
    return bookings.some((b) => {
      const existingStart = new Date(b.checkIn);
      const existingEnd = new Date(b.checkOut);
      return newStart < existingEnd && newEnd > existingStart;
    });
  }

  async function bookThisPlace() {
    if (!user) {
      setRedirect("/login");
      return;
    }

    if (!checkIn || !checkOut || !name.trim() || !phone.trim()) {
      alert("Please fill all the required fields.");
      return;
    }

    const newStart = new Date(checkIn);
    const newEnd = new Date(checkOut);

    if (isOverlapping(newStart, newEnd)) {
      alert("Selected dates overlap with an existing booking. Please choose different dates.");
      return;
    }

    const response = await axios.post("/bookings", {
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      place: place._id,
      price: numberOfNights * place.price,
    });

    const bookingId = response.data._id;
    setRedirect(`/account/bookings/${bookingId}`);
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="bg-white shadow p-4 rounded-2xl">
      <div className="text-2xl text-center">Price: ₹{place.price} / night</div>
      <div className="border rounded-2xl mt-4">
        <div className="flex flex-col md:flex-row">
          <div className="py-3 px-4">
            <label>Check in:</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              minDate={new Date()}
              excludeDates={bookedDates}
              className="border p-2 w-full"
              placeholderText="Select check-in"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div className="py-3 px-4 border-t md:border-t-0 md:border-l">
            <label>Check out:</label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
              excludeDates={bookedDates}
              className="border p-2 w-full"
              placeholderText="Select check-out"
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>

        <div className="py-3 px-4 border-t">
          <label>Number of guests:</label>
          <input
            type="number"
            value={numberOfGuests}
            onChange={(ev) => setNumberOfGuests(ev.target.value)}
            className="border p-2 w-full"
          />
        </div>

        {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t">
            <label>Your full name:</label>
            <input
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className="border p-2 w-full"
            />
            <label className="mt-2">Phone number:</label>
            <input
              type="tel"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              className="border p-2 w-full"
            />
          </div>
        )}
      </div>

      <button onClick={bookThisPlace} className="primary mt-4 w-full">
        Book this place
        {numberOfNights > 0 && (
          <span> ₹{numberOfNights * place.price}</span>
        )}
      </button>
    </div>
  );
}
function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (!token) {
      return reject(new Error("JWT token not provided"));
    }

    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) return reject(err);
      resolve(userData);
    });
  });
}
