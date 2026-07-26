export type StartProfile = {
    age: string;
    height: string;
    weight: string;
    income: string;
    savings: string;
    city: string;
    profession: string;
    activityLevel: string;
    notes: string;
  };
  
  export const emptyStartProfile: StartProfile = {
    age: '25',
    height: '170',
    weight: '65',
    income: '2800',
    savings: '10000',
    city: 'Moscow',
    profession: 'Lawyer',
    activityLevel: 'Low',
    notes: 'I am a lawyer and I want to save money for my retirement.',
  };