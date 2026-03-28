import { createContext, useContext, useState } from "react";

const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  const [answers, setAnswers] = useState({
    comfort: "",
    occasion: [],      
    weather: "",
    style: [],         
    fit: "",     
    items: [],         
    avoidItems: [],  
    colorsWear: [],  
    colorsAvoid: [],  
    tripPriority: "",
  });

  return (
    <SurveyContext.Provider value={{ answers, setAnswers }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => useContext(SurveyContext);
