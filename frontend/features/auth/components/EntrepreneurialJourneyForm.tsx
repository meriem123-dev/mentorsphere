"use client";

import { useState } from "react";
import { EntrepreneurialJourneyStep } from "./EntrepreneurialJourney";

export function EntrepreneurialJourneyForm() {
  const [formData, setFormData] = useState({
    profession: "",
    level: "",
    domains: [],
    skills: [],
  });

  const handleNext = () => {
    console.log(formData);
  };

  const handlePrevious = () => {
    console.log("Retour");
  };

  return (
    <EntrepreneurialJourneyStep
      formData={formData}
      setFormData={setFormData}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />
  );
}