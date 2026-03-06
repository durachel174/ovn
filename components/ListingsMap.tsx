'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useMemo } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

type Listing = {
  id: string
  title: string
  price: number | null
  is_free: boolean
  image_url: string | null
  lat: number | null
  lng: number | null
}

function createPriceIcon(label: string) {
  return L.divIcon({
    html: `
      <div style="
        background: #cc7d8d;
        color: white;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        display: inline-block;
      ">
        ${label}
      </div>
    `,
    className: '',
    iconSize: undefined,
    iconAnchor: undefined,
    popupAnchor: [0, -20],
  })
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
          url={`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
          attribution='&copy; <a href="https://www.mapbox.com">Mapbox</a>'
          tileSize={512}
          zoomOffset={-1}
        />
        {mappable.map(listing => (
          <Marker
            key={listing.id}
            position={[listing.lat!, listing.lng!]}
            icon={createPriceIcon(listing.is_free ? 'Free' : `$${listing.price}`)}
          >
            <Popup>
              <div style={{ minWidth: '120px' }}>
                {listing.image_url && (
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '6px' }}
                  />
                )}
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#292524' }}>{listing.title}</p>
                <p style={{ fontSize: '11px', color: '#cc7d8d', marginTop: '2px', fontStyle: listing.is_free ? 'italic' : 'normal' }}>
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