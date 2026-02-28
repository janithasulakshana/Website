# Configuration & Constants Guide

## Overview
This document explains how to use the centralized constants system in the Trail Colombo project. All hardcoded values for contact information, pricing, tour details, and other configurations are now managed in dedicated configuration files.

## Frontend Configuration

### Location
`frontend/src/config/constants.js`

### Available Constants

#### 1. CONTACT_INFO
Contains all contact-related information:
```javascript
import { CONTACT_INFO } from "../config/constants";

// Usage
const phone = CONTACT_INFO.phone;        // "0768465747"
const email = CONTACT_INFO.email;        // "info@trailcolombo.com"
const whatsapp = CONTACT_INFO.whatsapp;  // "0768465747"
```

**Properties:**
- `phone` - Local phone number
- `phoneFormatted` - International format
- `email` - Business email
- `whatsapp` - WhatsApp contact
- `facebook` - Facebook URL
- `instagram` - Instagram URL

#### 2. COMPANY_INFO
Company branding and details:
```javascript
import { COMPANY_INFO } from "../config/constants";

const name = COMPANY_INFO.name;              // "Lets Go Colombo Tours by J"
const tagline = COMPANY_INFO.tagline;        // "Explore Colombo Like Never Before"
const yearsInBusiness = COMPANY_INFO.yearsInBusiness; // "10+"
```

#### 3. TOUR_PACKAGES
All tour package details with pricing:
```javascript
import { TOUR_PACKAGES } from "../config/constants";

// Loop through packages
TOUR_PACKAGES.forEach(tour => {
  console.log(`${tour.name} - $${tour.price}`);
  console.log(tour.includes); // Array of inclusions
});
```

**Package Structure:**
- `id` - Unique identifier
- `name` - Package name
- `duration` - Tour duration
- `price` - Price in USD
- `icon` - Emoji icon
- `description` - Short description
- `color` - Bootstrap color class
- `attractions` - Number of attractions
- `includes` - Array of inclusions

#### 4. TOUR_FEATURES
Feature highlights for marketing:
```javascript
import { TOUR_FEATURES } from "../config/constants";

TOUR_FEATURES.map(feature => (
  <div key={feature.title}>
    <h5>{feature.icon} {feature.title}</h5>
    <p>{feature.description}</p>
  </div>
))
```

#### 5. BENEFITS
Why Choose Us section benefits:
```javascript
import { BENEFITS } from "../config/constants";

// Contains: title, description, icon
```

#### 6. TESTIMONIALS
Customer reviews and ratings:
```javascript
import { TESTIMONIALS } from "../config/constants";

// Contains: name, location, text, rating
```

#### 7. COMMITMENT_POINTS
Company commitment promises:
```javascript
import { COMMITMENT_POINTS } from "../config/constants";

// Contains: title, description
```

## Backend Configuration

### Location
`backend/config/constants.js`

### Available Constants

#### 1. CONTACT_INFO
```javascript
const { CONTACT_INFO } = require("./config/constants");

console.log(CONTACT_INFO.phone);     // "0768465747"
console.log(CONTACT_INFO.email);     // "info@trailcolombo.com"
```

#### 2. DATABASE
Database connection settings:
```javascript
const { DATABASE } = require("./config/constants");

// DATABASE.path = "./bookings.db"
```

#### 3. JWT
JWT authentication settings:
```javascript
const { JWT } = require("./config/constants");

// JWT.secret - From .env or fallback
// JWT.expiresIn = "24h"
// JWT.algorithm = "HS256"
```

#### 4. SERVER
Server configuration:
```javascript
const { SERVER } = require("./config/constants");

console.log(SERVER.port);  // 5000
console.log(SERVER.host);  // "localhost"
```

#### 5. TOUR_PRICING
Tour pricing information:
```javascript
const { TOUR_PRICING } = require("./config/constants");

console.log(TOUR_PRICING.halfDay);      // 55.99
console.log(TOUR_PRICING.fullDay);      // 66.99
console.log(TOUR_PRICING.tukTukSafari); // 32.99
```

#### 6. MESSAGES
API response messages:
```javascript
const { MESSAGES } = require("./config/constants");

// Success messages
res.json({ message: MESSAGES.SUCCESS.bookingCreated });

// Error messages
res.status(400).json({ error: MESSAGES.ERROR.validationError });
```

#### 7. ADMIN
Admin configuration:
```javascript
const { ADMIN } = require("./config/constants");

// Default credentials
console.log(ADMIN.defaultEmail);  // "admin@trailcolombo.com"
```

## How to Update Values

### Updating Contact Information

**Before (Hardcoded):**
```jsx
<a href="tel:0768465747">0768465747</a>
```

**After (Using Constants):**
```jsx
import { CONTACT_INFO } from "../config/constants";

<a href={`tel:${CONTACT_INFO.phone}`}>
  {CONTACT_INFO.phoneFormatted}
</a>
```

### Updating Tour Pricing

**Edit `frontend/src/config/constants.js`:**
```javascript
export const TOUR_PACKAGES = [
  {
    id: 1,
    name: "Half Day Tour",
    price: 55.99,  // ← Update here
    // ...
  }
];
```

**Or `backend/config/constants.js`:**
```javascript
TOUR_PRICING: {
  halfDay: 55.99,  // ← Update here
}
```

### Adding New Tour Package

```javascript
export const TOUR_PACKAGES = [
  // ... existing packages
  {
    id: 4,
    name: "Night Tour",
    duration: "3 Hours",
    price: 45.99,
    icon: "🌙",
    description: "Experience Colombo's vibrant nightlife...",
    color: "dark",
    attractions: "3-4 attractions",
    includes: [
      "Professional guide",
      "Hotel pickup & drop-off",
      "Dinner included",
      "Light refreshments"
    ]
  }
];
```

## Best Practices

1. **Single Source of Truth**: Update values in constants files, not in component files
2. **Use Constants in Components**: Always import and use constants instead of hardcoding
3. **Frontend + Backend Sync**: Keep frontend and backend constants synchronized
4. **Environment Variables**: Use `.env` for sensitive data (API keys, secrets)
5. **Grouping**: Related values are grouped logically (CONTACT_INFO, COMPANY_INFO, etc.)

## Component Usage Examples

### Home Page
```jsx
import {
  COMPANY_INFO,
  TOUR_PACKAGES,
  BENEFITS,
  TESTIMONIALS,
  COMMITMENT_POINTS,
  CONTACT_INFO
} from "../config/constants";

export default function Home() {
  return (
    <div>
      <h1>{COMPANY_INFO.name}</h1>
      <p>{COMPANY_INFO.tagline}</p>
      
      {TOUR_PACKAGES.map(tour => (
        <div key={tour.id}>
          <h3>{tour.name}</h3>
          <p>${tour.price}</p>
        </div>
      ))}
      
      <a href={`tel:${CONTACT_INFO.phone}`}>
        {CONTACT_INFO.phoneFormatted}
      </a>
    </div>
  );
}
```

### Admin Dashboard
```jsx
import { TOUR_PRICING } from "../config/constants";

function AdminDashboard() {
  const prices = TOUR_PRICING;
  // Use pricing info for display
}
```

### API Responses (Backend)
```javascript
const { MESSAGES, CONTACT_INFO } = require("./config/constants");

app.post("/api/bookings", (req, res) => {
  try {
    // Create booking...
    res.json({
      success: true,
      message: MESSAGES.SUCCESS.bookingCreated,
      contactInfo: CONTACT_INFO.whatsapp
    });
  } catch (error) {
    res.status(400).json({
      error: MESSAGES.ERROR.validationError
    });
  }
});
```

## Advantages of Using Constants

✅ **Centralized Management**: Update once, reflected everywhere  
✅ **Consistency**: No duplicate values across files  
✅ **Easy Maintenance**: Find and edit values quickly  
✅ **Type Safety**: IDE autocomplete support  
✅ **Scalability**: Easy to add new features  
✅ **Localization Ready**: Easy to translate all strings  
✅ **Version Control**: Track all changes easily  

## Future Enhancements

- Localization support (multiple languages)
- Theme customization (colors, fonts)
- Multi-currency support
- Dynamic pricing based on season
- Feature flags for A/B testing
