interface Pet {
  _id: string
  name: string
  description: string
  age: string
  size: string
  gender: string
  type: string
  breed?: string
  location: {
    address: string
    coordinates: [number, number]
  }
  contact: {
    email: string
    name: string
  }
  images: string[]
  createdAt: string
}

interface PetStructuredDataProps {
  pet: Pet
}

export function PetStructuredData({ pet }: PetStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${pet.name} - ${pet.type} en adopción`,
    "description": pet.description,
    "image": pet.images,
    "category": "Pet Adoption",
    "brand": {
      "@type": "Organization",
      "name": "Safe Haven"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CRC",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 días
      "seller": {
        "@type": "Organization",
        "name": "Safe Haven"
      }
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Edad",
        "value": pet.age
      },
      {
        "@type": "PropertyValue", 
        "name": "Tamaño",
        "value": pet.size
      },
      {
        "@type": "PropertyValue",
        "name": "Género", 
        "value": pet.gender
      },
      {
        "@type": "PropertyValue",
        "name": "Raza",
        "value": pet.breed || "Mestizo"
      }
    ],
    "location": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": pet.location.address,
        "addressCountry": "CR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": pet.location.coordinates[0],
        "longitude": pet.location.coordinates[1]
      }
    },
    "datePublished": pet.createdAt,
    "publisher": {
      "@type": "Organization",
      "name": "Safe Haven",
      "url": "https://safehaven.cr"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
