"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight } from "lucide-react"

// Define a type for the listing based on our RETS knowledge
export interface Listing {
  ListingID?: string;
  L_ListingID?: string;
  L_DisplayId?: string;
  
  // Address
  StreetNumber?: string;
  L_AddressNumber?: string;
  StreetName?: string;
  L_AddressStreet?: string;
  City?: string;
  L_City?: string;
  
  // Price
  ListPrice?: string;
  L_AskingPrice?: string;
  
  // Specs
  BedroomsTotal?: string;
  LM_Int1_11?: string; // Beds
  
  BathroomsTotalInteger?: string;
  LM_Dec_35?: string; // Baths
  
  LivingArea?: string;
  LM_Int2_4?: string; // SqFt
  
  // Details
  PublicRemarks?: string;
  LR_remarks3636?: string;
  L_Remarks?: string;
  
  // Status
  MlsStatus?: string;
  L_Status?: string;
  
  photos?: string[];
}

// Helper to safely get values
export const getVal = (item: Listing, keys: (keyof Listing)[]) => {
  for (const k of keys) {
    if (item[k] !== undefined && item[k] !== null && item[k] !== "") return item[k];
  }
  return undefined;
};

interface PropertyCardProps {
  property: Listing;
  index: number;
}

export function PropertyCard({ property, index }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const photos = property.photos || [];
  const hasMultiplePhotos = photos.length > 1;

  const nextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const id = getVal(property, ['ListingID', 'L_ListingID', 'L_DisplayId']) || index;
  const price = getVal(property, ['ListPrice', 'L_AskingPrice']);
  const streetNum = getVal(property, ['StreetNumber', 'L_AddressNumber']) || "";
  const streetName = getVal(property, ['StreetName', 'L_AddressStreet']) || "";
  const city = getVal(property, ['City', 'L_City']);
  const beds = getVal(property, ['BedroomsTotal', 'LM_Int1_11']);
  const baths = getVal(property, ['BathroomsTotalInteger', 'LM_Dec_35']);
  const sqft = getVal(property, ['LivingArea', 'LM_Int2_4']);
  const status = getVal(property, ['MlsStatus', 'L_Status']) || "Active";
  const remarks = getVal(property, ['PublicRemarks', 'LR_remarks3636', 'L_Remarks']);
  
  const displayImage = photos.length > 0 ? photos[currentImageIndex] : null;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all group border-0 shadow-md flex flex-col h-full">
      <div className="relative aspect-[4/3] bg-muted group/image">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={`${streetNum} ${streetName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 bg-secondary/30">
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}

        {/* Carousel Controls */}
        {hasMultiplePhotos && (
          <>
            <button 
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity z-10">
              {currentImageIndex + 1}/{photos.length}
            </div>
          </>
        )}

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <Badge className="bg-white/95 text-foreground hover:bg-white shadow-sm backdrop-blur-sm border-0 font-medium pointer-events-auto">
            {status}
          </Badge>
        </div>
        
        {/* Gradient Overlay for Price */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 pointer-events-none">
          <p className="text-white font-bold text-xl drop-shadow-md">
            {price ? `$${Number(price).toLocaleString()}` : "Price Upon Request"}
          </p>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1" title={`${streetNum} ${streetName}`}>
            {streetNum} {streetName}
            {!streetNum && !streetName && "Address Unavailable"}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{city || "City Unavailable"}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/50 text-sm mb-3">
          <div className="flex flex-col items-center justify-center p-1">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <Bed className="w-4 h-4 text-primary" />
              <span>{beds || "-"}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Beds</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 border-l border-border/50">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <Bath className="w-4 h-4 text-primary" />
              <span>{baths || "-"}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Baths</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 border-l border-border/50">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <Square className="w-4 h-4 text-primary" />
              <span>{sqft ? Number(sqft).toLocaleString() : "-"}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Sq Ft</span>
          </div>
        </div>

        {remarks && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
            {remarks}
          </p>
        )}

        <Button variant="outline" size="sm" className="w-full mt-auto" asChild>
          <Link href={`/properties/${id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
