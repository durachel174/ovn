'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useState } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

type Listing = {
  id: string
  title: string
  price: number | null
  is_free: boolean
  image_url: string | null
  lat: number | null
  lng: number | null
}

export default function ListingsMap({ listings }: { listings: Listing[] }) {
  const mappable = listings.filter(l => l.lat && l.lng)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ height: '500px' }}>
      <MapContainer
        center={[37.7749, -122.4194]}
        zoom={11}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {mappable.map(listing => (
          <Marker
            key={listing.id}
            position={[listing.lat!, listing.lng!]}
            icon={icon}
          >
            <Popup>
              <div className="p-1">
                {listing.image_url && (
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="font-semibold text-stone-800 text-sm">{listing.title}</p>
                <p className="text-mauve-500 text-xs mt-0.5">
                  {listing.is_free ? 'Complimentary' : `$${listing.price}`}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}