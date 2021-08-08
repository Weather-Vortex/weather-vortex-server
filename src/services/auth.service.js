//confirmation email-> it will be finished after the implementation of frontend
//questo servirà per il frontend

import axios from "axios";
const API_URL = "http://localhost:12000/api/";
const verifyUser = (code) => {
    return axios.get(API_URL + "confirm/" + code).then((response) => {
      return response.data;
    });
  };
  
  export default {

    verifyUser,
  };