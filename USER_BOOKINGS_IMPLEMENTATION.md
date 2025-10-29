# User Bookings Implementation with GET /user/bookings API

## Overview
Implemented a comprehensive user bookings system that integrates with the `GET /user/bookings` API endpoint to display, manage, and interact with user's booking history. The implementation includes BookingCard component integration, booking cancellation, success handling from booking flow, and robust error management.

## API Integration

### Endpoint: `GET /user/bookings`

#### Expected Response Format
```json
[
  {
    "id": 123,
    "turfName": "Premium Sports Arena",
    "status": "CONFIRMED",
    "date": "2025-10-29",
    "slots": [
      {
        "slotId": 10,
        "startTime": "10:00",
        "endTime": "11:00",
        "price": 1500
      },
      {
        "slotId": 11,
        "startTime": "11:00", 
        "endTime": "12:00",
        "price": 1500
      }
    ],
    "totalAmount": 3000,
    "createdAt": "2025-10-29T08:47:22.167Z",
    "reference": "BOOK-TXN1730185642167ABC123"
  }
]
```

#### Alternative Response Format (with wrapper)
```json
{
  "bookings": [...], // Array of booking objects
  "total": 5,
  "page": 1,
  "limit": 20
}
```

## Implementation Details

### 1. Updated API Service

**File:** `/src/services/api.ts`

```typescript
export const bookingAPI = {
  createBooking: (data: BookingRequest) => api.post('/user/bookings', data),
  getUserBookings: () => api.get('/user/bookings'),
  cancelBooking: (id: number) => api.delete(`/user/bookings/${id}`),
};
```

**Changes Made:**
- ✅ Updated `getUserBookings` endpoint from `/bookings/user` to `/user/bookings`
- ✅ Updated `cancelBooking` endpoint from `/bookings/${id}` to `/user/bookings/${id}`
- ✅ Maintained consistent endpoint structure

### 2. Enhanced Type Definitions

**File:** `/src/types/index.ts`

```typescript
export interface Booking {
  id: number;
  turfId?: number;
  turfName: string;
  date: string;
  slots: Array<{
    slotId?: number;
    startTime: string;
    endTime: string;
    price?: number;
  }>;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'COMPLETED';
  createdAt?: string;
  playerName?: string;
  phone?: string;
  reference?: string;
}
```

**Key Updates:**
- ✅ Made `slots` array more flexible for different API response formats
- ✅ Made `turfId` and `createdAt` optional for backward compatibility
- ✅ Added `COMPLETED` status option
- ✅ Aligned with BookingCard component requirements

### 3. Comprehensive MyBookingsScreen

**File:** `/src/screens/user/MyBookingsScreen.tsx`

#### Key Features:

##### **Flexible API Response Handling**
```typescript
let bookingsData = response.data;

// Handle wrapped response format
if (bookingsData && typeof bookingsData === 'object' && bookingsData.bookings) {
  bookingsData = bookingsData.bookings;
}

// Ensure array format
if (!Array.isArray(bookingsData)) {
  console.warn('⚠️ Bookings data is not an array:', bookingsData);
  bookingsData = [];
}
```

##### **Smart Sorting**
```typescript
const sortedBookings = bookingsData.sort((a: Booking, b: Booking) => {
  const dateA = new Date(a.createdAt || a.date).getTime();
  const dateB = new Date(b.createdAt || b.date).getTime();
  return dateB - dateA; // Newest first
});
```

##### **Success Flow Integration**
```typescript
// Handle success from booking flow
const newBooking = route.params?.newBooking;
const showSuccess = route.params?.showSuccess;

if (showSuccess && newBooking) {
  Toast.show({
    type: 'success',
    text1: 'Booking Successful! 🎉',
    text2: `Reference: ${newBooking.reference}`,
    visibilityTime: 4000,
  });
}
```

##### **Enhanced Booking Cancellation**
```typescript
const handleCancelBooking = async (booking: Booking) => {
  Alert.alert(
    'Cancel Booking',
    `Are you sure you want to cancel your booking at ${booking.turfName}?\n\nThis action cannot be undone.`,
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => confirmCancelBooking(booking),
      },
    ]
  );
};
```

##### **Optimistic UI Updates**
```typescript
// Update booking status locally without refetching
setBookings(prevBookings =>
  prevBookings.map(b =>
    b.id === booking.id
      ? { ...b, status: 'CANCELLED' as const }
      : b
  )
);
```

## BookingCard Integration

### Required Data Structure
The BookingCard component expects this exact structure:

```typescript
interface BookingCardData {
  id: number;           // Shows as "#123"
  turfName: string;     // Main heading
  status: string;       // Status badge
  date: string;         // Date with calendar icon
  slots: Array<{        // Time display
    startTime: string;
    endTime: string;
  }>;
  totalAmount: number;  // Price with ₹ symbol
  createdAt?: string;   // "Booked on" date
}
```

### How BookingCard Renders Data

```
┌─────────────────────────────────────────┐
│ Premium Sports Arena        [CONFIRMED] │ #123
│ ─────────────────────────────────────── │
│ 📅 29 Oct 2025                         │
│ ⏰ 10:00-11:00 (single) or "2 slots"   │
│ 💰 ₹3000                               │
│ 📅 Booked on 29 Oct 2025               │
│ ─────────────────────────────────────── │
│ [🚫 Cancel Booking]                     │
└─────────────────────────────────────────┘
```

## User Experience Features

### 1. Loading States
- **Initial Load**: Full-screen spinner with "Loading your bookings..."
- **Pull-to-Refresh**: Native refresh control with theme colors
- **Cancellation**: "Cancelling Booking" toast with progress

### 2. Empty State
- **Professional Message**: "No Bookings Yet"
- **Helpful Description**: Guide user to make first booking
- **Visual Icon**: Calendar outline icon

### 3. Error Handling
```typescript
const errorMessage = error.response?.data?.message || 
                    error.response?.data?.error || 
                    'Failed to fetch bookings';
```

### 4. Success Feedback
- **Booking Success**: Shows reference number from booking flow
- **Cancellation Success**: Confirms action with turf name
- **Visual Feedback**: Different toast types (success, error, info)

### 5. Navigation Integration
- **Route Parameters**: Handles `newBooking` and `showSuccess` params
- **Parameter Cleanup**: Clears params after showing success message
- **Booking Press**: Ready for navigation to booking details

## Booking Cancellation Flow

### 1. Eligibility Check (in BookingCard)
```typescript
const isBookingCancellable = () => {
  const bookingDate = new Date(booking.date);
  const now = new Date();
  const diffHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Allow cancellation if booking is at least 2 hours in the future
  return diffHours >= 2 && booking.status === 'CONFIRMED';
};
```

### 2. Confirmation Dialog
- **Clear Message**: Shows turf name and consequences
- **Action Buttons**: "No" (cancel) and "Yes, Cancel" (destructive style)
- **User Safety**: Requires explicit confirmation

### 3. API Integration
- **Endpoint**: `DELETE /user/bookings/${bookingId}`
- **Optimistic Updates**: Updates UI immediately
- **Error Recovery**: Reverts on API failure

### 4. Status Updates
- **Local State**: Updates booking status to 'CANCELLED'
- **Visual Feedback**: Status badge changes color
- **Action Removal**: Cancel button disappears

## Error Handling & Resilience

### API Error Scenarios
1. **Network Issues**: Shows generic "Failed to fetch bookings"
2. **Server Errors**: Shows specific error message from API
3. **Invalid Response**: Handles non-array responses gracefully
4. **Cancellation Failures**: Shows specific cancellation error

### Data Validation
```typescript
// Handles various API response formats
if (bookingsData && typeof bookingsData === 'object' && bookingsData.bookings) {
  bookingsData = bookingsData.bookings;
}

if (!Array.isArray(bookingsData)) {
  console.warn('⚠️ Bookings data is not an array:', bookingsData);
  bookingsData = [];
}
```

### Fallback Mechanisms
- **Empty Array**: Shows empty state instead of crashing
- **Missing Fields**: Uses optional chaining and fallbacks
- **Date Parsing**: Handles both `createdAt` and `date` for sorting

## Performance Optimizations

### 1. Efficient Rendering
- **FlatList**: Optimized for large booking lists
- **Key Extraction**: Uses booking ID for React keys
- **Conditional Rendering**: Only renders necessary components

### 2. State Management
- **Optimistic Updates**: Immediate UI feedback
- **Minimal Refetches**: Only refreshes when necessary
- **Callback Optimization**: Uses `useCallback` for refresh

### 3. Memory Management
- **Component Cleanup**: Clears route params after use
- **Efficient Sorting**: In-place array sorting
- **Selective Updates**: Only updates changed bookings

## Integration with Booking Flow

### From TurfDetailScreen/BookingSummaryScreen
```typescript
// After successful booking
navigation.navigate('Bookings', { 
  newBooking: bookingResponse,
  showSuccess: true 
});
```

### In MyBookingsScreen
```typescript
// Shows success toast with reference
if (showSuccess && newBooking) {
  Toast.show({
    type: 'success',
    text1: 'Booking Successful! 🎉',
    text2: `Reference: ${newBooking.reference}`,
    visibilityTime: 4000,
  });
}
```

## Testing Considerations

### Manual Testing Scenarios
1. **Empty Bookings**: Test with no bookings in database
2. **Single Booking**: Test with one booking
3. **Multiple Bookings**: Test sorting and display
4. **Different Statuses**: Test CONFIRMED, CANCELLED, PENDING
5. **Cancellation Flow**: Test eligibility and process
6. **Success Flow**: Test navigation from booking creation
7. **Network Issues**: Test offline/poor connection
8. **API Errors**: Test server error responses

### API Response Variations
1. **Direct Array**: `[booking1, booking2, ...]`
2. **Wrapped Object**: `{ bookings: [...], total: 5 }`
3. **Empty Response**: `[]` or `{ bookings: [] }`
4. **Error Response**: `{ error: "message" }`

## Future Enhancements

### Planned Features
1. **Booking Details Screen**: Full booking information view
2. **Filter/Search**: Filter by status, date, turf
3. **Pagination**: Handle large booking lists
4. **Export Functionality**: Download booking history
5. **Recurring Bookings**: Support for repeat bookings

### Technical Improvements
1. **Caching**: Cache bookings for offline viewing
2. **Real-time Updates**: WebSocket for live status updates
3. **Analytics**: Track booking patterns and user behavior
4. **Accessibility**: Screen reader support and navigation
5. **Internationalization**: Multi-language support

This implementation provides a robust, user-friendly booking management system that handles various API response formats, provides excellent error handling, and delivers a smooth user experience from booking creation to management.
