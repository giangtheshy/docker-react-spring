import axios from "axios";

export default axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "/api/v1"
      : "http://localhost:8080/api/v1",
});
