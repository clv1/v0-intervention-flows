import { Event } from '@/lib/types';

export const userTeamLink = [
  // {
  // 	id: 1,
  // 	firstName: 'Ivan',
  // 	lastName: 'Mihaylov',
  // 	position: 'Head Coach',
  // 	email: 'im566@bath.ac.uk',
  // 	userID: 'adec18a0-4b86-47e9-94df-90491b1ede02',
  // 	teamID: 2,
  // },
  // {
  // 	id: 2,
  // 	firstName: 'Kevin',
  // 	lastName: '...',
  // 	position: 'Assistant Coach',
  // 	email: 'kevin@amatra.ai',
  // 	userID: '48b898ac-8087-41ea-af23-34d7c7d4deba',
  // 	teamID: 1,
  // },
  // {
  // 	id: 3,
  // 	firstName: 'Nikola',
  // 	lastName: 'Penev',
  // 	position: 'Assistant Coach',
  // 	email: 'niki@amatra.ai',
  // 	userID: '78028088-70c7-4cfb-8ca3-8bcce78d658b',
  // 	teamID: 1,
  // },
  // {
  // 	id: 4,
  // 	firstName: 'Ivan',
  // 	lastName: 'Mihaylov',
  // 	position: 'Head Coach',
  // 	email: 'ivan.mihailov37@gmail.com',
  // 	userID: '222d6969-578e-4a30-af68-9568bf90df39',
  // 	teamID: 1,
  // },
  // {
  // 	id: 5,
  // 	firstName: 'Christian',
  // 	lastName: 'Penev',
  // 	position: 'Head Coach',
  // 	email: 'chrisipenev@gmail.com',
  // 	userID: '5ae6478e-43f8-4892-80cd-0cb3e76b1d5f',
  // 	teamID: 1,
  // },
  // {
  // 	id: 6,
  // 	firstName: 'Test',
  // 	lastName: 'User',
  // 	position: 'Assistant Coach',
  // 	email: 'info@amatra.ai',
  // 	userID: '1dc880cb-2bdf-41a3-9c1c-4ff842f82fe2',
  // 	teamID: 1,
  // },
  // {
  // 	id: 7,
  // 	firstName: 'Denny',
  // 	lastName: 'Noor',
  // 	position: 'Sport Scientist',
  // 	email: 'd.noor@az.nl',
  // 	userID: '17e0fa94-3a13-468a-a50f-76d8f80b0707',
  // 	teamID: 2,
  // },
];

export const sidebarData = [
  [
    {
      id: 1,
      name: 'Log out',
      target: 'logOut',
      active: false,
    },
  ],
  [
    {
      id: 1,
      name: 'Home',
      target: 'home',
      active: true,
    },
    // {
    //   id: 2,
    //   name: 'Log Data',
    //   target: 'logData',
    //   active: false,
    // },
    {
      id: 3,
      name: 'Personnel',
      target: 'personnel',
      active: false,
    },
    // {
    //   id: 4,
    //   name: 'Squad Builder',
    //   target: 'squadBuilder',
    //   active: false,
    // },
    {
      id: 5,
      name: 'Performance',
      target: 'performance',
      active: false,
    },
    {
      id: 6,
      name: 'Schedule Page',
      target: 'schedule-page',
      active: false,
    },
  ],
];

export const TimePeriodData = [
  {
    id: 1,
    name: 'Today',
    active: true,
  },
  {
    id: 2,
    name: 'Last 7 Days',
    active: false,
  },
  {
    id: 3,
    name: 'Last 30 Days',
    active: false,
  },
  {
    id: 4,
    name: 'Last 6 Months',
    active: false,
  },
];

export const BehaviourInsightsData = [
  {
    id: 1,
    name: 'Sleep Performance',
    change: 19,
  },
  {
    id: 2,
    name: 'Low Workload',
    change: 15,
  },
  {
    id: 3,
    name: 'Sauna >30 min',
    change: 14,
  },
  {
    id: 4,
    name: 'Magnesium Supplement',
    change: 10,
  },
  {
    id: 5,
    name: 'Early Sunlight Exposure',
    change: 7,
  },
  {
    id: 6,
    name: 'Early Training',
    change: 1,
  },
  {
    id: 7,
    name: 'After Match Day',
    change: -2,
  },
  {
    id: 8,
    name: 'Late Meal',
    change: -8,
  },
  {
    id: 9,
    name: 'Felt Sick',
    change: -10,
  },
  {
    id: 10,
    name: 'Hotel Sleep - Away Day',
    change: -19,
  },
  {
    id: 11,
    name: '50% Sleep Performance',
    value: 50,
    change: -20,
  },
  {
    id: 12,
    name: 'Alcohol Consumption',
    change: -25,
  },
];

export const ListOfBehaviours = [
  {
    id: 1,
    name: 'Sleep & Circadian',
    subcategories: [
      'Zone 2 Cardio',
      'Meditation',
      'Stretching',
      'Cold shower',
      'Cold plunge',
      'Cryotherapy',
      'Sauna',
      'Contrast therapy',
      'Breathwork',
      'Foam rolling',
      'Massage',
      'Massage gun',
    ],
  },
  {
    id: 2,
    name: 'Lifestyle',
    subcategories: [
      'Zone 2 Cardio',
      'Meditation',
      'Stretching',
      'Cold shower',
      'Cold plunge',
      'Cryotherapy',
      'Sauna',
      'Contrast therapy',
      'Breathwork',
      'Foam rolling',
      'Massage',
      'Massage gun',
    ],
  },
  {
    id: 3,
    name: 'Mindset',
    subcategories: [
      'Zone 2 Cardio',
      'Meditation',
      'Stretching',
      'Cold shower',
      'Cold plunge',
      'Cryotherapy',
      'Sauna',
      'Contrast therapy',
      'Breathwork',
      'Foam rolling',
      'Massage',
      'Massage gun',
    ],
  },
  {
    id: 4,
    name: 'Wellbeing',
    subcategories: [
      'Zone 2 Cardio',
      'Meditation',
      'Stretching',
      'Cold shower',
      'Cold plunge',
      'Cryotherapy',
      'Sauna',
      'Contrast therapy',
      'Breathwork',
      'Foam rolling',
      'Massage',
      'Massage gun',
    ],
  },
  {
    id: 5,
    name: 'Nutrition',
    subcategories: [
      'Zone 2 Cardio',
      'Meditation',
      'Stretching',
      'Cold shower',
      'Cold plunge',
      'Cryotherapy',
      'Sauna',
      'Contrast therapy',
      'Breathwork',
      'Foam rolling',
      'Massage',
      'Massage gun',
    ],
  },
  {
    id: 6,
    name: 'Recovery Protocols',
    subcategories: [
      'Zone 2 Cardio',
      'Meditation',
      'Stretching',
      'Cold shower',
      'Cold plunge',
      'Cryotherapy',
      'Sauna',
      'Contrast therapy',
      'Breathwork',
      'Foam rolling',
      'Massage',
      'Massage gun',
    ],
  },
];

export const BehaviourAnalysisSelectors = [
  { id: 1, name: 'Behaviour Analysis' },
  { id: 2, name: 'Behaviour Timelines' },
  { id: 3, name: 'Recovery Profile' },
];

export const PlayerPerformanceMetricCategories = [
  {
    id: 1,
    name: 'Sleep Metrics',
    metrics: [
      { id: 1, name: 'Restorative Sleep %', isPercentage: true },
      { id: 2, name: 'Sleep Efficiency %', isPercentage: true },
      { id: 3, name: 'Sleep Performance %', isPercentage: true },
      { id: 4, name: 'Sleep Duration', isPercentage: false },
      { id: 5, name: 'Sleep Consistency %', isPercentage: true },
      {
        id: 6,
        name: 'Restorative Sleep Duration',
        isPercentage: false,
      },
      { id: 7, name: 'Time In Bed', isPercentage: false },
    ],
  },
  {
    id: 2,
    name: 'Performance Metrics',
    metrics: [
      { id: 1, name: 'RHR', isPercentage: false },
      { id: 2, name: 'HRV', isPercentage: false },
      { id: 3, name: 'Recovery Score', isPercentage: true },
      { id: 4, name: 'Strain', isPercentage: true },
    ],
  },
];

export const timelineChartPositioning = [
  {
    style: 'line-chart-overlay-percentage',
    padding: {
      left: 22,
      right: 0,
    },
    margin: {
      left: 20,
      right: 0,
    },
  },
  {
    style: 'line-chart-overlay-non-percentage',
    padding: {
      left: 0,
      right: 0,
    },
    margin: {
      left: -15,
      right: 0,
    },
  },
  {
    style: 'line-chart-non-overlay',
    padding: {
      left: 45,
      right: 4,
    },
    margin: {
      left: 10,
      right: 0,
    },
  },
  {
    style: 'bar-chart-overlay-percentage',
    padding: {
      left: 50,
      right: 0,
    },
    margin: {
      left: 6,
      right: 0,
    },
  },
  {
    style: 'bar-chart-overlay-non-percentage',
    padding: {
      left: 0,
      right: 0,
    },
    margin: {
      left: 0,
      right: 0,
    },
  },
  {
    style: 'bar-chart-non-overlay',
    padding: {
      left: 72,
      right: 13,
    },
    margin: {
      left: 0,
      right: 0,
    },
  },
];

export const timelineChartPercentageMetricPadding = [
  {
    metric: 'HRV',
    paddingRight: 25,
  },
  {
    metric: 'RHR',
    paddingRight: 25,
  },
  {
    metric: 'Restorative Sleep Duration',
    paddingRight: 60.1,
  },
  {
    metric: 'Sleep Duration',
    paddingRight: 60.1,
  },
];

export const timelineChartNonPercentageMetricPadding = [
  {
    metric: 'HRV',
    paddingRight: 8,
  },
  {
    metric: 'RHR',
    paddingRight: 8,
  },
  {
    metric: 'Restorative Sleep Duration',
    paddingRight: 60.1,
  },
  {
    metric: 'Sleep Duration',
    paddingRight: 60.1,
  },
];

export const athleteEvents: Record<string, Event[]> = {
  '1': [
    { type: 'Rest Day', date: '2025-02-15' },
    { type: 'Rest Day', date: '2025-02-22' },
    { type: 'Rest Day', date: '2025-03-01' },
    { type: 'Rest Day', date: '2025-03-06' },
    { type: 'Rest Day', date: '2025-03-13' },
    { type: 'Rest Day', date: '2025-03-17' },
    { type: 'Rest Day', date: '2025-03-27' },
    { type: 'Travel', date: '2025-01-01' },
    { type: 'Travel', date: '2025-01-05' },
    { type: 'Travel', date: '2025-01-06' },
    { type: 'Travel', date: '2025-03-07' },
    { type: 'Travel', date: '2025-03-10' },
    { type: 'Travel', date: '2025-04-07' },
    { type: 'Travel', date: '2025-04-08' },
    { type: 'Hotel', date: '2025-04-08' },
    { type: 'Hotel', date: '2025-04-09' },
    { type: 'Hotel', date: '2025-04-10' },
    { type: 'Hotel', date: '2025-04-11' },
    { type: 'Hotel', date: '2025-04-12' },
  ],
  '2': [
    { type: 'Travel', date: '2025-01-25' },
    { type: 'Travel', date: '2025-02-07' },
    { type: 'Travel', date: '2025-02-23' },
    { type: 'Travel', date: '2025-03-19' },
    { type: 'Travel', date: '2025-04-03' },
    { type: 'Travel', date: '2025-04-07' },
    { type: 'Rest Day', date: '2025-02-10' },
    { type: 'Rest Day', date: '2025-02-19' },
    { type: 'Rest Day', date: '2025-02-23' },
    { type: 'Rest Day', date: '2025-03-07' },
    { type: 'Rest Day', date: '2025-03-11' },
    { type: 'Rest Day', date: '2025-03-13' },
  ],
  '4': [
    { type: 'Travel', date: '2025-01-07' },
    { type: 'Travel', date: '2025-01-31' },
    { type: 'Travel', date: '2025-02-04' },
    { type: 'Travel', date: '2025-03-07' },
    { type: 'Travel', date: '2025-03-09' },
    { type: 'Travel', date: '2025-04-02' },
    { type: 'Travel', date: '2025-04-07' },
    { type: 'Rest Day', date: '2025-01-01' },
    { type: 'Rest Day', date: '2025-01-08' },
    { type: 'Rest Day', date: '2025-01-11' },
    { type: 'Rest Day', date: '2025-01-18' },
    { type: 'Rest Day', date: '2025-01-19' },
    { type: 'Rest Day', date: '2025-01-26' },
    { type: 'Rest Day', date: '2025-02-01' },
    { type: 'Rest Day', date: '2025-02-08' },
    { type: 'Rest Day', date: '2025-02-11' },
    { type: 'Rest Day', date: '2025-02-15' },
    { type: 'Rest Day', date: '2025-03-01' },
    { type: 'Rest Day', date: '2025-03-04' },
    { type: 'Rest Day', date: '2025-03-29' },
    { type: 'Rest Day', date: '2025-04-03' },
    { type: 'Rest Day', date: '2025-04-04' },
  ],
  default: [
    { type: 'Rest Day', date: '2025-03-16' },
    { type: 'Travel', date: '2025-03-21' },
    { type: 'Hotel', date: '2025-03-21' },
    { type: 'Travel', date: '2025-03-22' },
    { type: 'Rest Day', date: '2025-03-23' },
    { type: 'Rest Day', date: '2025-03-30' },
    { type: 'Travel', date: '2025-04-04' },
    { type: 'Hotel', date: '2025-04-04' },
    { type: 'Travel', date: '2025-04-05' },
    { type: 'Rest Day', date: '2025-04-06' },
    { type: 'Rest Day', date: '2025-04-13' },
    { type: 'Travel', date: '2025-04-18' },
    { type: 'Hotel', date: '2025-04-18' },
    { type: 'Travel', date: '2025-04-19' },
    { type: 'Rest Day', date: '2025-04-20' },
  ],
};

export const athleteMatchDays = {
  '1': [
    { type: 'Match Day', date: '2025-02-16' },
    { type: 'Match Day', date: '2025-02-23' },
    { type: 'Match Day', date: '2025-03-02' },
    { type: 'Match Day', date: '2025-03-07' },
    { type: 'Match Day', date: '2025-03-14' },
    { type: 'Match Day', date: '2025-03-18' },
    { type: 'Match Day', date: '2025-03-28' },
  ],
  '2': [
    { type: 'Match Day', date: '2025-02-02' },
    { type: 'Match Day', date: '2025-03-15' },
    { type: 'Match Day', date: '2025-03-17' },
    { type: 'Match Day', date: '2025-03-25' },
    { type: 'Match Day', date: '2025-03-26' },
    { type: 'Match Day', date: '2025-03-28' },
    { type: 'Match Day', date: '2025-03-31' },
    { type: 'Match Day', date: '2025-04-01' },
    { type: 'Match Day', date: '2025-04-02' },
  ],
  '4': [
    { type: 'Match Day', date: '2025-01-02' },
    { type: 'Match Day', date: '2025-01-22' },
    { type: 'Match Day', date: '2025-01-24' },
    { type: 'Match Day', date: '2025-01-27' },
    { type: 'Match Day', date: '2025-02-05' },
    { type: 'Match Day', date: '2025-02-07' },
    { type: 'Match Day', date: '2025-02-12' },
    { type: 'Match Day', date: '2025-02-14' },
    { type: 'Match Day', date: '2025-02-19' },
    { type: 'Match Day', date: '2025-03-14' },
    { type: 'Match Day', date: '2025-03-19' },
    { type: 'Match Day', date: '2025-03-21' },
    { type: 'Match Day', date: '2025-03-26' },
    { type: 'Match Day', date: '2025-03-28' },
    { type: 'Match Day', date: '2025-03-31' },
    { type: 'Match Day', date: '2025-04-11' },
  ],
  default: [
    { type: 'Match Day', date: '2025-02-01' },
    { type: 'Match Day', date: '2025-02-08' },
    { type: 'Match Day', date: '2025-02-15' },
    { type: 'Match Day', date: '2025-02-22' },
    { type: 'Match Day', date: '2025-03-01' },
    { type: 'Match Day', date: '2025-03-08' },
    { type: 'Match Day', date: '2025-03-15' },
    { type: 'Match Day', date: '2025-03-22' },
    { type: 'Match Day', date: '2025-03-29' },
    { type: 'Match Day', date: '2025-04-05' },
  ],
};
