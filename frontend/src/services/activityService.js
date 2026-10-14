import api from "./api";

const getActivities = async () => {
  const response = await api.get("/activities");
  return response.data;
};

const getActivity = async (id) => {
  const response = await api.get(`/activities/${id}`);
  return response.data;
};

const createActivity = async (activityData) => {
  const response = await api.post(
    "/activities",
    activityData
  );

  return response.data;
};

const updateActivity = async (
  id,
  activityData
) => {
  const response = await api.put(
    `/activities/${id}`,
    activityData
  );

  return response.data;
};

const deleteActivity = async (id) => {
  const response = await api.delete(
    `/activities/${id}`
  );

  return response.data;
};

export {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
};