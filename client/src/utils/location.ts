import axios from "axios";


export const fetchReverseGeolocation = async (loction:
    [ number,
     number]
  ): Promise<string> => {
    try {
        const lat: number = loction[0];
        const lon: number = loction[1];
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
      );
      return response.data.display_name;
    } catch (error) {
      console.error("Error fetching reverse geolocation:", error);
      return "Unknown Location";
    }
  };