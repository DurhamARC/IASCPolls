import axios from "axios";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

export const client = axios.create({});
export default client;

export const API = {
  getInstitutionList: () => axios.get("/api/institutions/"),

  postNewInstitution: (institution) =>
    axios.post("/api/institutions/", {
      name: institution,
      country: "",
    }),
};
