import { createContext, useContext, useState } from "react";

const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  const [answers, setAnswers] = useState({
    comfort: "",
    occasion: [],      
    weather: "",
    style: [],         
    preferFit: "",     
    items: [],         
    avoid_items: [],  
    colors_wear: [],  
    colors_avoid: [],  
    trip_priority: "",
  });

  return (
    <SurveyContext.Provider value={{ answers, setAnswers }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => useContext(SurveyContext);
