import api from "./api";

const getPesticideRecords = async () => {
  const response = await api.get("/pesticide");
  return response.data;
};

const getPesticideRecord = async (id) => {
  const response = await api.get(`/pesticide/${id}`);
  return response.data;
};

const createPesticideRecord = async (pesticideData) => {
  const response = await api.post(
    "/pesticide",
    pesticideData
  );

  return response.data;
};

const updatePesticideRecord = async (
  id,
  pesticideData
) => {
  const response = await api.put(
    `/pesticide/${id}`,
    pesticideData
  );

  return response.data;
};

const deletePesticideRecord = async (id) => {
  const response = await api.delete(
    `/pesticide/${id}`
  );

  return response.data;
};

export {
  getPesticideRecords,
  getPesticideRecord,
  createPesticideRecord,
  updatePesticideRecord,
  deletePesticideRecord,
};