"use client";

//import { useEffect } from "react";

export default function CustomMap() {
    /*
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Initialize the map
      const map = new google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
          center: { lat: 9.9326, lng: -84.0907 }, // San José center
          zoom: 11,
          mapId: "eco_colones_map", // Optional: custom map style ID
        }
      );

      // Example static markers (later you can fetch from Supabase)
      const centers = [
        { lat: 9.9326, lng: -84.0907, name: "Centro UCR" },
        { lat: 9.9103, lng: -84.075, name: "Centro Curridabat" },
        { lat: 9.945, lng: -84.13, name: "Centro Escazú" },
      ];

      centers.forEach((c) => {
        new google.maps.Marker({
          position: { lat: c.lat, lng: c.lng },
          map,
          title: c.name,
        });
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div
      id="map"
      className="w-full h-[400px] rounded-xl border border-gray-200 shadow-sm"
    ></div>
  );*/
}
