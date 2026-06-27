import { createSlice } from "@reduxjs/toolkit";
import { use } from "react";
const token = localStorage.getItem('token')
const user=localStorage.getItem("user")
const role = localStorage.getItem("role")
let isLoggedIn;
if(token){
  isLoggedIn=true
}else{
  isLoggedIn=false  
}
let userdata;

  if (user){
    userdata=JSON.parse(user)
  } 
    else{
            userdata=null
    } 
  

const initialState={
isLoggedIn:isLoggedIn,
user:userdata,
role:role,
}
const authslice = createSlice({
  name:'auth',
  initialState,
  reducers:{
      login: (state, action) => {
      state.isLoggedIn = true;
       state.user = action.payload; 
      state.role=action.payload.role
  },
   logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.role=null
    },
  },
})
export const { login, logout } = authslice.actions;
export default authslice
