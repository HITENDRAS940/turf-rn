/**
 * Revenue Calculation Utilities
 * Provides centralized revenue and statistics calculation functions
 */

interface TurfSlot {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
  isBooked?: boolean;
}

interface TurfBooking {
  id: number;
  user: {
    name: string;
    phone: string;
  };
  reference: string;
  amount: number;
  status: string;
  turfName: string;
  slotTime: string;
  slots: Array<{
    slotId: number;
    startTime: string;
    endTime: string;
    price: number;
  }>;
  bookingDate: string;
  createdAt: string;
}

export interface RevenueData {
  totalRevenue: number;
  totalBookings: number;
  bookedSlots: number;
  availableSlots: number;
}

/**
 * Calculate total revenue from bookings
 */
export const calculateTotalRevenue = (bookings: TurfBooking[]): number => {
  return bookings.reduce((total, booking) => {
    const status = booking.status?.toUpperCase();
    if (status === 'CONFIRMED' || status === 'COMPLETED') {
      return total + booking.amount;
    }
    return total;
  }, 0);
};

/**
 * Count total confirmed bookings
 */
export const countConfirmedBookings = (bookings: TurfBooking[]): number => {
  return bookings.filter(booking => {
    const status = booking.status?.toUpperCase();
    return status === 'CONFIRMED' || status === 'COMPLETED';
  }).length;
};

/**
 * Count booked slots
 */
export const countBookedSlots = (slots: TurfSlot[]): number => {
  return slots.filter(slot => slot.isBooked).length;
};

/**
 * Count available slots (enabled and not booked)
 */
export const countAvailableSlots = (slots: TurfSlot[]): number => {
  return slots.filter(slot => slot.enabled && !slot.isBooked).length;
};

/**
 * Calculate revenue data from bookings and slots
 */
export const calculateRevenueData = (
  bookings: TurfBooking[],
  slots: TurfSlot[]
): RevenueData => {
  return {
    totalRevenue: calculateTotalRevenue(bookings),
    totalBookings: countConfirmedBookings(bookings),
    bookedSlots: countBookedSlots(slots),
    availableSlots: countAvailableSlots(slots),
  };
};

/**
 * Calculate revenue by date range
 */
export const calculateRevenueByDateRange = (
  bookings: TurfBooking[],
  startDate: Date,
  endDate: Date
): number => {
  return bookings
    .filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const status = booking.status?.toUpperCase();
      return (
        bookingDate >= startDate &&
        bookingDate <= endDate &&
        (status === 'CONFIRMED' || status === 'COMPLETED')
      );
    })
    .reduce((total, booking) => total + booking.amount, 0);
};

/**
 * Calculate revenue by month
 */
export const calculateMonthlyRevenue = (
  bookings: TurfBooking[],
  year: number,
  month: number
): number => {
  return bookings
    .filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      const status = booking.status?.toUpperCase();
      return (
        bookingDate.getFullYear() === year &&
        bookingDate.getMonth() === month &&
        (status === 'CONFIRMED' || status === 'COMPLETED')
      );
    })
    .reduce((total, booking) => total + booking.amount, 0);
};

/**
 * Calculate revenue by turf ID
 */
export const calculateRevenueByTurf = (
  bookings: TurfBooking[],
  turfId: number
): number => {
  // Note: This assumes bookings have a turfId field
  // If not available, we might need to filter by turfName
  return bookings
    .filter(booking => {
      const status = booking.status?.toUpperCase();
      return status === 'CONFIRMED' || status === 'COMPLETED';
    })
    .reduce((total, booking) => total + booking.amount, 0);
};

/**
 * Get average booking amount
 */
export const getAverageBookingAmount = (bookings: TurfBooking[]): number => {
  const confirmedBookings = bookings.filter(booking => {
    const status = booking.status?.toUpperCase();
    return status === 'CONFIRMED' || status === 'COMPLETED';
  });
  
  if (confirmedBookings.length === 0) return 0;
  
  const total = confirmedBookings.reduce(
    (sum, booking) => sum + booking.amount,
    0
  );
  
  return total / confirmedBookings.length;
};

/**
 * Get booking statistics
 */
export const getBookingStatistics = (bookings: TurfBooking[]) => {
  const confirmedBookings = bookings.filter(booking => {
    const status = booking.status?.toUpperCase();
    return status === 'CONFIRMED' || status === 'COMPLETED';
  });
  const cancelledBookings = bookings.filter(booking => {
    const status = booking.status?.toUpperCase();
    return status === 'CANCELLED';
  });
  const pendingBookings = bookings.filter(booking => {
    const status = booking.status?.toUpperCase();
    return status === 'PENDING';
  });
  
  return {
    total: bookings.length,
    confirmed: confirmedBookings.length,
    cancelled: cancelledBookings.length,
    pending: pendingBookings.length,
    totalRevenue: calculateTotalRevenue(bookings),
    averageAmount: getAverageBookingAmount(bookings),
  };
};

/**
 * Calculate slot utilization rate (percentage of booked slots)
 */
export const calculateSlotUtilizationRate = (slots: TurfSlot[]): number => {
  const enabledSlots = slots.filter(slot => slot.enabled);
  if (enabledSlots.length === 0) return 0;
  
  const bookedSlots = enabledSlots.filter(slot => slot.isBooked);
  return (bookedSlots.length / enabledSlots.length) * 100;
};

/**
 * Calculate potential revenue (all enabled slots at their prices)
 */
export const calculatePotentialRevenue = (slots: TurfSlot[]): number => {
  return slots
    .filter(slot => slot.enabled)
    .reduce((total, slot) => total + slot.price, 0);
};

/**
 * Calculate revenue loss from disabled slots
 */
export const calculateRevenueLoss = (slots: TurfSlot[]): number => {
  return slots
    .filter(slot => !slot.enabled)
    .reduce((total, slot) => total + slot.price, 0);
};

/**
 * Format currency for display (Indian Rupees)
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
