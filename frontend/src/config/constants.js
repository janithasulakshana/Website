/**
 * Application Configuration and Constants
 * Centralized variables for email, phone, social links, tour details, etc.
 */

export const CONTACT_INFO = {
  phone: "0703097737",
  phoneFormatted: "+94 70 309 7737",
  email: "letsgocolombotoursbyj@gmail.com",
  whatsapp: "0703097737",
  facebook: "https://www.facebook.com/share/1FBPQpwss7/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/trailcolombo"
};

export const COMPANY_INFO = {
  name: "Lets Go Colombo Tours by J",
  tagline: "Explore Colombo Like Never Before",
  description: "Discover the vibrant culture, historic landmarks, and modern attractions of Colombo with our expertly curated city tours.",
  yearsInBusiness: "10+",
  taglineShort: "Best Around Colombo"
};

export const TOUR_PACKAGES = [
  {
    id: 1,
    name: "Half Day Tour",
    duration: "4-5 Hours",
    price: 55.99,
    icon: "⏰",
    description: "Perfect for visitors with limited time, this quick tour showcases the most popular attractions in Colombo.",
    color: "primary",
    attractions: "2-3 major attractions",
    includes: [
      "Professional local guide",
      "Hotel pickup & drop-off",
      "Refreshments included",
      "Photography stops",
      "Flexible timing",
      "Small group (max 3)"
    ]
  },
  {
    id: 2,
    name: "Full Day Tour",
    duration: "8-10 Hours",
    price: 66.99,
    icon: "🌅",
    description: "Discover Colombo's essence on our Full-Day Tour. Explore iconic landmarks and immerse in the city's rich culture.",
    color: "warning",
    attractions: "5-7 major attractions",
    includes: [
      "Expert local guide",
      "Hotel pickup & drop-off",
      "Lunch at local restaurant",
      "Multiple photography stops",
      "Flexible itinerary",
      "Souvenir shopping time",
      "Small group (max 3)"
    ]
  },
  {
    id: 3,
    name: "Tuk Tuk Safari",
    duration: "4 Hours",
    price: 32.99,
    icon: "🛺",
    description: "Explore Colombo's charm in a unique way. Discover iconic landmarks and hidden gems with our adventurous tuk tuk experience.",
    color: "info",
    attractions: "3-4 major attractions",
    includes: [
      "Expert driver guide",
      "Hotel pickup & drop-off",
      "Refreshments included",
      "Adventurous experience",
      "Photography stops",
      "Small group (max 3)"
    ]
  }
];

export const TOUR_FEATURES = [
  {
    title: "Cultural Heritage",
    description: "Visit historic temples, museums, and colonial-era buildings that tell the story of Colombo.",
    icon: "🏛️"
  },
  {
    title: "Modern Attractions",
    description: "Experience Colombo's skyline, Lotus Tower, and contemporary development projects.",
    icon: "🌆"
  },
  {
    title: "Local Experiences",
    description: "Connect with local guides and discover authentic Colombo through personalized tours.",
    icon: "🤝"
  }
];

export const BENEFITS = [
  {
    title: "Free Hotel Pickup",
    description: "We pick up travelers from Colombo 1-15 for free of charge. You can also enter your own location.",
    icon: "🚗"
  },
  {
    title: "Cheapest Prices",
    description: "We offer the most competitive pricing for city tours in town without compromising quality.",
    icon: "💰"
  },
  {
    title: "Comfortable Rides",
    description: "Travel in comfort with our air-conditioned vehicles. Maximum 3 people per tour for personalized service.",
    icon: "😊"
  },
  {
    title: "Expert Guides",
    description: "Our expert guides provide friendly, knowledgeable service with deep insights about Colombo's attractions.",
    icon: "👨‍🏫"
  }
];

export const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    location: "New York",
    text: "Amazing experience! Our guide was knowledgeable and friendly. The tour was perfectly tailored to our interests.",
    rating: 5
  },
  {
    name: "Michael Chen",
    location: "Toronto",
    text: "Best city tour I've ever experienced. The attention to detail and personalized service was outstanding!",
    rating: 5
  },
  {
    name: "Emma Wilson",
    location: "London",
    text: "Highly recommend Trail Colombo! Informative, engaging, and truly immersive. Won't regret booking!",
    rating: 5
  }
];

export const ADMIN_CREDENTIALS = {
  defaultEmail: "letsgocolombotoursbyj@gmail.com",
  defaultPassword: "admin123"
};

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 5000
};

export const COMMITMENT_POINTS = [
  {
    title: "No Rushing",
    description: "Explore at your own pace with flexible itineraries"
  },
  {
    title: "Safety First",
    description: "Professional drivers and experienced guides"
  },
  {
    title: "Comfort",
    description: "Air-conditioned vehicles and convenient pickups"
  },
  {
    title: "Authentic Experience",
    description: "Connect with local culture and hidden gems"
  }
];

export const SOCIAL_MEDIA = {
  facebook: "https://www.facebook.com/share/1FBPQpwss7/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/trailcolombo",
  whatsapp: "https://wa.me/94703097737",
  twitter: "https://twitter.com/trailcolombo"
};

// Service hours
export const SERVICE_HOURS = {
  weekday: "8:00 AM - 6:00 PM",
  weekend: "8:00 AM - 7:00 PM",
  holidays: "By appointment"
};

// Currency
export const CURRENCY = {
  symbol: "$",
  code: "USD"
};
