import { createContext, useContext, useState } from "react";

const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  const [answers, setAnswers] = useState({
    comfort: "",
    fit: "",
    occasion: [],
    weather: "",
    style: "",
    items: [],
    colorsWear: [],
    colorsAvoid: [],
    tripPriority: "",
    avoidItems: [],
  });

  return (
    <SurveyContext.Provider value={{ answers, setAnswers }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => useContext(SurveyContext);