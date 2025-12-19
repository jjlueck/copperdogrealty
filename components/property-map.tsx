"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { Listing, getVal } from './property-card'
import Image from 'next/image'
import { MapPin, Bed, Bath, Square } from 'lucide-react'

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center (will be overridden by bounds)
const defaultCenter = {
  lat: 43.39,
  lng: -95.16
};

interface PropertyMapProps {
  properties: Listing[];
  apiKey: string;
}

export function PropertyMap({ properties, apiKey }: PropertyMapProps) {
  const router = useRouter();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  })

  const [selectedProperty, setSelectedProperty] = useState<Listing | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = null;
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
    if (properties.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      properties.forEach(property => {
        const lat = parseFloat(property.LMD_MP_Latitude || "");
        const lng = parseFloat(property.LMD_MP_Longitude || "");
        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend({ lat, lng });
        }
      });
      map.fitBounds(bounds);
    }
  }, [properties]);

  // Adjust bounds when properties change
  useEffect(() => {
    if (mapRef.current && properties.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasCoords = false;
      properties.forEach(property => {
        const lat = parseFloat(property.LMD_MP_Latitude || "");
        const lng = parseFloat(property.LMD_MP_Longitude || "");
        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend({ lat, lng });
          hasCoords = true;
        }
      });
      if (hasCoords) {
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [properties]);

  if (!isLoaded) return <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">Loading Map...</div>

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border shadow-sm min-h-[600px]">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {properties.map((property, idx) => {
          const lat = parseFloat(property.LMD_MP_Latitude || "");
          const lng = parseFloat(property.LMD_MP_Longitude || "");
          
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={getVal(property, ['ListingID', 'L_ListingID', 'L_DisplayId']) || idx}
              position={{ lat, lng }}
              onClick={() => setSelectedProperty(property)}
              title={`${getVal(property, ['StreetNumber', 'L_AddressNumber']) || ""} ${getVal(property, ['StreetName', 'L_AddressStreet']) || ""}`}
            />
          );
        })}

        {selectedProperty && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedProperty.LMD_MP_Latitude || "0"),
              lng: parseFloat(selectedProperty.LMD_MP_Longitude || "0")
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div 
              className="p-1 max-w-[200px] cursor-pointer"
              onClick={() => router.push(`/properties/${getVal(selectedProperty, ['ListingID', 'L_ListingID', 'L_DisplayId'])}`)}
            >
              {selectedProperty.photos && selectedProperty.photos.length > 0 && (
                <div className="relative aspect-video mb-2 rounded overflow-hidden">
                  <Image 
                    src={selectedProperty.photos[0]} 
                    alt="Property" 
                    fill 
                    className="object-cover"
                  />
                </div>
              )}
              <h4 className="font-bold text-sm line-clamp-1">
                {getVal(selectedProperty, ['StreetNumber', 'L_AddressNumber'])} {getVal(selectedProperty, ['StreetName', 'L_AddressStreet'])}
              </h4>
              <p className="text-xs text-primary font-bold mt-1">
                ${Number(getVal(selectedProperty, ['ListPrice', 'L_AskingPrice'])).toLocaleString()}
              </p>
              <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Bed className="w-3 h-3"/> {getVal(selectedProperty, ['BedroomsTotal', 'LM_Int1_11'])}</span>
                <span className="flex items-center gap-1"><Bath className="w-3 h-3"/> {getVal(selectedProperty, ['BathroomsTotalInteger', 'LM_Dec_35'])}</span>
                <span className="flex items-center gap-1"><Square className="w-3 h-3"/> {getVal(selectedProperty, ['LivingArea', 'LM_Int2_4'])}</span>
              </div>
              <div className="block text-center bg-primary text-primary-foreground text-[10px] py-1 px-2 rounded mt-2 hover:bg-primary/90">
                View Details
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
