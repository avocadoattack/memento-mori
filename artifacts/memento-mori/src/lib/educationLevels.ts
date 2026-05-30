export interface EducationLevel {
  id: string;
  label: string;
  sublabel: string;
  years: number;
  hoursPerDay: number;
  daysPerYear: number;
  startAge: number;
  endAge: number;
}

export const EDUCATION_LEVELS: EducationLevel[] = [
  { id: 'primary',    label: 'Primary School', sublabel: 'Ages 5–11',   years: 6, hoursPerDay: 5.5, daysPerYear: 180, startAge: 5,  endAge: 11 },
  { id: 'middle',     label: 'Middle School',  sublabel: 'Ages 11–14',  years: 3, hoursPerDay: 6.0, daysPerYear: 180, startAge: 11, endAge: 14 },
  { id: 'highschool', label: 'High School',    sublabel: 'Ages 14–18',  years: 4, hoursPerDay: 6.5, daysPerYear: 180, startAge: 14, endAge: 18 },
  { id: 'bachelors',  label: "Bachelor's",     sublabel: '4 years',     years: 4, hoursPerDay: 5.0, daysPerYear: 220, startAge: 18, endAge: 22 },
  { id: 'masters',    label: "Master's",       sublabel: '2 years',     years: 2, hoursPerDay: 6.0, daysPerYear: 220, startAge: 22, endAge: 24 },
  { id: 'phd',        label: 'PhD',            sublabel: '4 years avg', years: 4, hoursPerDay: 8.0, daysPerYear: 250, startAge: 24, endAge: 28 },
];

export const DEFAULT_EDUCATION_LEVELS = ['primary', 'middle', 'highschool'];
