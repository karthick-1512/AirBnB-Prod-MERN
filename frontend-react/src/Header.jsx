import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext.jsx";

export default function Header() {
  const { user } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const navigate = useNavigate();

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await axios.get(`/search?query=${encodeURIComponent(searchTerm)}`);
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      navigate(`/place/${suggestions[0]._id}`);
      setSearchTerm('');
      setSuggestions([]);
    }
    if(e.key==="Enter" && suggestions.length===0){
      navigate("/");
    }
  };

  // Clear suggestions on click
  const handleSuggestionClick = () => {
    setSearchTerm('');
    setSuggestions([]);
  };

  return (
    <header className="relative flex flex-col gap-2">
      <div className="flex justify-between items-center">
       
        <div className="flex items-center gap-20">
           <Link to={'/'} className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
               className="w-8 h-8 -rotate-90">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485
                   12 59.77 59.77 0 013.27 20.876L5.999
                   12zm0 0h7.5"/>
          </svg>
          <span className="font-bold text-xl">AirBnB</span>
        </Link>
  <Link to="/" className="text-gray-700 hover:text-primary font-medium transition  ml-6">
    Home
  </Link>

  <Link to="/account/bookings" className="text-gray-700 hover:text-primary font-medium transition">
    Bookings
  </Link>
  <Link to="/account/places" className="text-gray-700 hover:text-primary font-medium transition">
    My Listing
  </Link>
   {/* 🔍 Search Field */}
        <div className="relative">
          <div className="relative w-full max-w-md mx-auto">
  <div className="flex items-center bg-white border border-gray-300 rounded-full px-3 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition gap-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4 text-gray-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0011.454 11.454z"
      />
    </svg>

    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      placeholder="Search places..."
      className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none focus:ring-0 focus:outline-none"
    />
  </div>

  {/* 🔽 Suggestions Dropdown */}
  {isFocused && suggestions.length > 0 && (
    <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 shadow-md rounded-lg z-20 overflow-hidden">
      {suggestions.map((place) => (
        <Link
          to={`/place/${place._id}`}
          key={place._id}
          onClick={handleSuggestionClick}
          className="block px-4 py-2 hover:bg-gray-100 transition"
        >
          <div className="font-medium">{place.title}</div>
          <div className="text-sm text-gray-500">{place.address}</div>
        </Link>
      ))}
    </div>
  )}
</div>
  </div>


       


        </div>

        {/* 👤 Navigation Buttons */}
<div className="flex items-center gap-4">
  {/* <Link to="/" className="text-gray-700 hover:text-primary font-medium transition">
    Home
  </Link>

  <Link to="/account/bookings" className="text-gray-700 hover:text-primary font-medium transition">
    Bookings
  </Link> */}

  <Link
    to={user ? '/account' : '/login'}
    className="flex items-center gap-2 border border-gray-300 rounded-full py-2 px-4 hover:shadow transition"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>

    <div className="bg-gray-500 text-white rounded-full border border-gray-500 overflow-hidden">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6 relative top-1"
      >
        <path
          fillRule="evenodd"
          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0
             0116.498 0 .75.75 0 01-.437.695A18.683
             18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75
             0 01-.437-.695z"
          clipRule="evenodd"
        />
      </svg>
    </div>

    {!!user && <div>{user.name}</div>}
  </Link>
</div>

      </div>
    </header>
  );
}
