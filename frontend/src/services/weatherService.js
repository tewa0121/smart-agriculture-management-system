
import api from "./api";

export const getWeatherRecords = async () => {
  const response = await api.get("/weather");
  return response.data;
};

export const getWeatherRecord = async (id) => {
  const response = await api.get(`/weather/${id}`);
  return response.data;
};

export const createWeatherRecord = async (weatherData) => {
  const response = await api.post("/weather", weatherData);
  return response.data;
};

export const updateWeatherRecord = async (id, weatherData) => {
  const response = await api.put(`/weather/${id}`, weatherData);
  return response.data;
};

export const deleteWeatherRecord = async (id) => {
  const response = await api.delete(`/weather/${id}`);
  return response.data;
};