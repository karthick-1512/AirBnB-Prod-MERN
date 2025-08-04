import axios from "axios";
import { Link, Navigate } from "react-router-dom";

import { useContext, useEffect, useState } from "react";
import AccountNav from "../AccountNav";
import { UserContext } from "../UserContext.jsx";
export default function PlacesPage() {
  const [places,setPlaces] = useState([]);
  
   const {ready,user,setUser} = useContext(UserContext);

  
  useEffect(() => {
    
    axios.get('/user-places').then(({data}) => {
      setPlaces(data);
    });
  }, []);


  if (ready && !user) {
      return <Navigate to={'/login'} />
    }
  return (
    <div>
      <AccountNav />
        <div className="text-center">
          <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to={'/account/places/new'}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Add new place
          </Link>
        </div>
        <div className="mt-4">
        {places.length > 0 && places.map(place => (
  <div
    key={place._id}
    className="relative flex bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition mb-10"
  >
    {/* 🗑️ Delete Button */}
<button
  onClick={async (e) => {
    e.preventDefault(); // stop <Link>
    const confirmed = window.confirm("how dare you delete it!!!");
    // if (confirmed) {
    //   try {
    //     await axios.delete(`/places/${place._id}`);
    //     setPlaces(prev => prev.filter(p => p._id !== place._id));
    //   } catch (err) {
    //     console.error("Delete failed:", err);
    //     alert("Failed to delete the place.");
    //   }
    // }
  }}
  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 px-3 py-1.5 rounded-full z-10 text-sm shadow"
>
  {/* Show 'X' on mobile */}
  <span className="block sm:hidden font-bold text-lg leading-none select-none">×</span>

  {/* Show trash icon and text on sm and bigger */}
  <span className="hidden sm:flex items-center gap-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 7.5h12M9.75 7.5v10.5m4.5-10.5v10.5M5.25 7.5L6 19.5a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5l.75-12M10.5 4.5h3m-6 0a.75.75 0 01.75-.75h6a.75.75 0 01.75.75V6H6.75V4.5z"
      />
    </svg>
    Delete
  </span>
</button>



    <Link
      to={`/account/places/${place._id}`}
      className="flex gap-4 w-full"
    >
      {/* 📷 Image Area */}
      <div className="w-36 h-36 bg-gray-200 flex-shrink-0 relative">
        {place.photos?.length > 0 ? (
          <img
            src={place.photos[0]}
            alt={place.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No photo</div>
        )}
      </div>

      {/* 📄 Content */}
      <div className="p-3 pr-5 flex flex-col justify-center">
        <h2 className="text-lg font-semibold">{place.title}</h2>
        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{place.description}</p>
      </div>
    </Link>
  </div>
))}

        </div>
    </div>
  );
}