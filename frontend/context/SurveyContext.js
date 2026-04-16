import { createContext, useContext, useState } from "react";

const SurveyContext = createContext();

const initialState = {
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
};

export const SurveyProvider = ({ children }) => {
  const [answers, setAnswers] = useState(initialState);

  const resetAnswers = () => {
    setAnswers(initialState);
  };

  return (
    <SurveyContext.Provider value={{ answers, setAnswers, resetAnswers }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => useContext(SurveyContext);