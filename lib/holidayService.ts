import { Holiday } from '../types';

const API_BASE_URL = 'https://date.nager.at/api/v3';

/**
 * Fetches public holidays for a given country and year.
 * @param countryCode - The ISO 3166-1 alpha-2 country code.
 * @param year - The year for which to fetch holidays.
 * @returns A promise that resolves to an array of Holiday objects.
 */
export const fetchPublicHolidays = async (countryCode: string, year: number): Promise<Holiday[]> => {
  try {
    // Nager.Date API is a free, open-source project that provides public holidays for over 100 countries.
    const response = await fetch(`${API_BASE_URL}/PublicHolidays/${year}/${countryCode}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // The API returns a detailed object for each holiday. We map it to our simpler Holiday type.
    return data.map((holiday: any): Holiday => ({
      date: holiday.date, // The API provides date in 'YYYY-MM-DD' format, which matches our needs.
      name: holiday.localName, // Use localName for the holiday's name in the local language.
    }));
  } catch (error) {
    console.error(`Could not fetch holidays for ${countryCode} in ${year}:`, error);
    throw error; // Re-throw the error to be handled by the calling component (e.g., to show a toast message).
  }
};
