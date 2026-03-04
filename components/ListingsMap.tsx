'use client'

import Map, { Marker, Popup } from 'react-map-gl'
import { useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'

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
  const [selected, setSelected] = useState<Listing | null>(null)

  const mappable = listings.filter(l => l.lat && l.lng)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ height: '500px' }}>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -122.4194,
          latitude: 37.7749,
          zoom: 10
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
      >
        {mappable.map(listing => (
          <Marker
            key={listing.id}
            longitude={listing.lng!}
            latitude={listing.lat!}
            anchor="bottom"
          >
            <button
              onClick={() => setSelected(listing)}
              className="bg-mauve-400 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md hover:bg-mauve-500 transition-colors"
            >
              {listing.is_free ? 'Free' : `$${listing.price}`}
            </button>
          </Marker>
        ))}

        {selected && selected.lat && selected.lng && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="top"
            onClose={() => setSelected(null)}
            closeOnClick={false}
          >
            <div className="p-1">
              {selected.image_url && (
                <img
                  src={selected.image_url}
                  alt={selected.title}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
              )}
              <p className="font-semibold text-stone-800 text-sm">{selected.title}</p>
              <p className="text-mauve-500 text-xs mt-0.5">
                {selected.is_free ? '🎁 Free' : `$${selected.price}`}
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}