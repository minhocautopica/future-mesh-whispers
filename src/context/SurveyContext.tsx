import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { addSubmission, syncOutbox } from '@/utils/db';

export type Demographics = {
  gender?: 'Masculino' | 'Feminino' | 'Não-binário' | 'Prefiro não responder';
  age?: 'Até 18' | '19-25' | '26-35' | '36-45' | '46-60' | '60+';
  resident?: boolean;
};

export type ResponseItem = {
  text?: string;
  audio?: string | null; // base64
};

export type SurveyData = {
  timestamp: string;
  station_id: string;
  demographics: Demographics;
  responses: {
    future_vision: ResponseItem;
    magic_wand: ResponseItem;
    what_is_missing: ResponseItem;
  };
};

interface SurveyContextValue {
  demographics: Demographics;
  setDemographics: (d: Demographics) => void;
  responses: SurveyData['responses'];
  updateResponse: (key: keyof SurveyData['responses'], value: ResponseItem) => void;
  reset: () => void;
  submit: () => Promise<number>;
}

const SurveyContext = createContext<SurveyContextValue | undefined>(undefined);

const defaultResponses = {
  future_vision: {},
  magic_wand: {},
  what_is_missing: {},
};

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [demographics, setDemographics] = useState<Demographics>({});
  const [responses, setResponses] = useState<SurveyData['responses']>(defaultResponses);

  useEffect(() => {
    const onOnline = () => syncOutbox();
    window.addEventListener('online', onOnline);
    syncOutbox();
    return () => window.removeEventListener('online', onOnline);
  }, []);

  const updateResponse: SurveyContextValue['updateResponse'] = (key, value) => {
    setResponses((prev) => {
      const newKeyResponse: ResponseItem = { };

      if (value.text !== undefined) {
        newKeyResponse.text = value.text;
        newKeyResponse.audio = null; // Clear audio
      } else if (value.audio !== undefined) {
        newKeyResponse.audio = value.audio;
        newKeyResponse.text = ''; // Clear text
      }

      return { ...prev, [key]: newKeyResponse };
    });
  };

  const reset = () => {
    setDemographics({});
    setResponses(defaultResponses);
  };

  const submit = async () => {
    const data: SurveyData = {
      timestamp: new Date().toISOString(),
      station_id: localStorage.getItem('station_id') || 'TOTEM-1',
      demographics,
      responses,
    };
    const id = await addSubmission(data);
    // Try to sync immediately
    await syncOutbox();
    reset();
    return id;
  };

  return (
    <SurveyContext.Provider value={{ demographics, setDemographics, responses, updateResponse, reset, submit }}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error('useSurvey must be used within SurveyProvider');
  return ctx;
}
