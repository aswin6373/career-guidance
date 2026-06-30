"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Stream } from "@/types/onboarding";

// ── Stream-aware choice data ─────────────────────────────────────────────────

const STREAM_CHOICES = [
  { label: "Science (Biology)", value: "science_bio" },
  { label: "Science (Maths)", value: "science_maths" },
  { label: "Science (Computer Science)", value: "science_cs" },
  { label: "Commerce", value: "commerce" },
  { label: "Humanities / Arts", value: "humanities" },
];

const SUBJECT_CHOICES: Record<Stream, Array<{ label: string; value: string }>> = {
  science_bio: [
    { label: "Biology", value: "Biology" },
    { label: "Chemistry", value: "Chemistry" },
    { label: "Physics", value: "Physics" },
    { label: "Mathematics", value: "Mathematics" },
  ],
  science_maths: [
    { label: "Mathematics", value: "Mathematics" },
    { label: "Physics", value: "Physics" },
    { label: "Chemistry", value: "Chemistry" },
    { label: "Computer Science", value: "Computer Science" },
  ],
  science_cs: [
    { label: "Computer Science", value: "Computer Science" },
    { label: "Mathematics", value: "Mathematics" },
    { label: "Physics", value: "Physics" },
    { label: "Chemistry", value: "Chemistry" },
  ],
  commerce: [
    { label: "Accountancy", value: "Accountancy" },
    { label: "Business Studies", value: "Business Studies" },
    { label: "Economics", value: "Economics" },
    { label: "Mathematics", value: "Mathematics" },
  ],
  humanities: [
    { label: "History", value: "History" },
    { label: "Political Science", value: "Political Science" },
    { label: "English", value: "English" },
    { label: "Psychology", value: "Psychology" },
    { label: "Economics", value: "Economics" },
  ],
};

const INTEREST_CHOICES: Record<Stream, Array<{ label: string; value: string }>> = {
  science_bio: [
    { label: "Helping sick people get better — figuring out what's wrong and treating them", value: "health_medicine" },
    { label: "Mixing chemicals or studying cells in a lab to find new things", value: "science_research" },
    { label: "Working outside with plants, farms, and animals", value: "nature_agriculture" },
    { label: "Explaining things clearly and helping others learn and grow", value: "helping_teaching" },
  ],
  science_maths: [
    { label: "Creating apps, games, or websites that people use every day", value: "technology_coding" },
    { label: "Using maths to figure out how machines, bridges, or systems work", value: "numbers_analysis" },
    { label: "Drawing and planning buildings, machines, or other structures", value: "building_engineering" },
    { label: "Looking at lots of numbers to find something useful or interesting", value: "science_research" },
  ],
  science_cs: [
    { label: "Writing code that makes a program, app, or website actually work", value: "technology_coding" },
    { label: "Deciding how an app or game looks — the screens, buttons, and colours", value: "design_visual" },
    { label: "Making computers smarter, or keeping systems safe from hackers", value: "numbers_analysis" },
    { label: "Building actual physical devices like robots, chips, or smart gadgets", value: "building_engineering" },
  ],
  commerce: [
    { label: "Starting or running my own business and making it grow", value: "business_money" },
    { label: "Handling money — tracking what a company earns, spends, and owes", value: "numbers_analysis" },
    { label: "Learning laws and helping people get justice in court", value: "law_justice" },
    { label: "Making ads, promoting products, or working in TV or social media", value: "media_communication" },
  ],
  humanities: [
    { label: "Helping people — teaching children, or guiding someone through a hard time", value: "helping_teaching" },
    { label: "Writing news stories, reporting events, or speaking on TV or radio", value: "media_communication" },
    { label: "Studying law and helping people fight for their rights in court", value: "law_justice" },
    { label: "Making art, posters, or designs that look really good", value: "design_visual" },
  ],
};

const SUBJECT_INTEREST_CHOICES: Record<string, Array<{ label: string; value: string }>> = {
  "Biology": [
    { label: "Helping sick people feel better — figuring out what's wrong and treating them", value: "health_medicine" },
    { label: "Running experiments in a lab — mixing, testing, and discovering new things", value: "science_research" },
    { label: "Working with plants, farms, and animals outdoors", value: "nature_agriculture" },
    { label: "Explaining things and helping others learn and understand", value: "helping_teaching" },
    { label: "Taking care of sick animals — like a vet does", value: "nature_agriculture" },
    { label: "Finding new medicines in a lab or helping hospitals get the right drugs", value: "health_medicine" },
  ],
  "Chemistry": [
    { label: "Running chemical experiments in a lab to discover something new", value: "science_research" },
    { label: "Creating medicines or useful chemicals that help people", value: "health_medicine" },
    { label: "Working with materials in factories — like making plastics, metals, or fuels", value: "building_engineering" },
    { label: "Studying pollution and finding cleaner ways to make energy", value: "nature_agriculture" },
    { label: "Helping solve crimes using chemical lab tests (like in crime shows)", value: "science_research" },
  ],
  "Physics": [
    { label: "Exploring deep science questions — like how gravity or light really works", value: "science_research" },
    { label: "Designing gadgets, electronics, or machines that do useful things", value: "building_engineering" },
    { label: "Working with space data and satellites — tracking stars or rockets", value: "numbers_analysis" },
    { label: "Building robots, chips, or new technology from scratch", value: "technology_coding" },
    { label: "Designing aircraft, vehicles, or big structures using physics", value: "building_engineering" },
  ],
  "Mathematics": [
    { label: "Solving really hard maths problems — just because it's satisfying", value: "numbers_analysis" },
    { label: "Working with money — calculating returns, risks, and investment plans", value: "business_money" },
    { label: "Using maths to write code or keep people's data safe online", value: "technology_coding" },
    { label: "Teaching maths or studying brand-new theories in the field", value: "helping_teaching" },
    { label: "Finding patterns in data — like using stats to predict sports results", value: "numbers_analysis" },
    { label: "Calculating financial risk for companies — like setting insurance prices", value: "business_money" },
  ],
  "Computer Science": [
    { label: "Writing code that makes a program, app, or website actually work", value: "technology_coding" },
    { label: "Designing how games, apps, or websites look and feel to users", value: "design_visual" },
    { label: "Teaching computers to learn things on their own — AI and smart data", value: "numbers_analysis" },
    { label: "Keeping computer networks safe from hackers and protecting data", value: "building_engineering" },
    { label: "Making 3D animations or visual effects for films or games", value: "design_visual" },
    { label: "Building the actual chips and circuits that go inside phones and computers", value: "building_engineering" },
  ],
  "Accountancy": [
    { label: "Keeping track of a company's money — what comes in and goes out", value: "business_money" },
    { label: "Checking if companies are following financial rules (auditing)", value: "numbers_analysis" },
    { label: "Teaching commerce or accounts in school or college", value: "helping_teaching" },
    { label: "Finding financial fraud — spotting where money has been stolen", value: "law_justice" },
    { label: "Advising businesses on how to save money and grow bigger", value: "business_money" },
  ],
  "Business Studies": [
    { label: "Starting your own business or a brand-new product from scratch", value: "business_money" },
    { label: "Making ads and campaigns that make people want to buy something", value: "media_communication" },
    { label: "Managing a team or running the daily work of a company", value: "helping_teaching" },
    { label: "Researching what customers want and the best way to reach them", value: "numbers_analysis" },
    { label: "Planning events or handling public relations for a company", value: "media_communication" },
  ],
  "Economics": [
    { label: "Understanding why prices go up or down — like petrol or gold", value: "numbers_analysis" },
    { label: "Advising banks or the government on how to manage the country's money", value: "business_money" },
    { label: "Researching how people and markets make decisions", value: "science_research" },
    { label: "Working with government to design policies that actually help people", value: "law_justice" },
    { label: "Helping companies or individuals decide where to invest their money", value: "business_money" },
  ],
  "English": [
    { label: "Writing articles, stories, or news that people love reading", value: "media_communication" },
    { label: "Teaching English or literature in a school or college", value: "helping_teaching" },
    { label: "Writing scripts, ads, or social media content for brands", value: "design_visual" },
    { label: "Studying how language and communication actually work", value: "science_research" },
    { label: "Editing books or writing content for magazines and websites", value: "media_communication" },
    { label: "Translating languages or handling communication for companies", value: "media_communication" },
  ],
  "Psychology": [
    { label: "Helping people deal with mental health problems — counselling or therapy", value: "health_medicine" },
    { label: "Researching how the human brain and behaviour really work", value: "science_research" },
    { label: "Working in HR — finding and selecting the right people for a job", value: "business_money" },
    { label: "Helping communities or social groups who are struggling", value: "helping_teaching" },
    { label: "Studying why people buy things — consumer behaviour and marketing", value: "numbers_analysis" },
  ],
};

function getDynamicInterestChoices(subject: string, stream: Stream) {
  if (SUBJECT_INTEREST_CHOICES[subject]) {
    return SUBJECT_INTEREST_CHOICES[subject];
  }

  const s = subject.toLowerCase();

  // Keyword matching
  if (s.includes("art") || s.includes("design") || s.includes("draw") || s.includes("paint") || s.includes("music") || s.includes("dance") || s.includes("sing") || s.includes("acting") || s.includes("drama") || s.includes("photo")) {
    return [
      { label: "Creating your own art, music, or performances to share with people", value: "design_visual" },
      { label: "Teaching art, music, or dance to young students", value: "helping_teaching" },
      { label: "Working in films, TV shows, or making online content", value: "media_communication" },
      { label: "Running an arts business or managing events and shows", value: "business_money" },
    ];
  }

  if (
    s.includes("sport") || s.includes("athlet") || s.includes("fitness") || s.includes("gym") ||
    s.includes("coach") || s.includes("physical") || s.includes("trainer") || s.includes("football") ||
    s.includes("cricket") || s.includes("basketball") || s.includes("badminton") || s.includes("hockey") ||
    s.includes("volleyball") || s.includes("tennis") || s.includes("kabaddi") || s.includes("swim") ||
    s.includes("running") || s.includes("athletics") || s.includes("martial") || s.includes("karate") ||
    s.includes("yoga") || s.includes("skating") || s.includes("play")
  ) {
    return [
      { label: "Training people to get fit or coaching a sports team", value: "defence_adventure" },
      { label: "Teaching physical education or sports in school", value: "helping_teaching" },
      { label: "Running a gym, sports club, or fitness centre", value: "business_money" },
      { label: "Reporting sports news or working in sports events and media", value: "media_communication" },
    ];
  }

  if (s.includes("cook") || s.includes("food") || s.includes("chef") || s.includes("bakery") || s.includes("baking") || s.includes("culinary") || s.includes("hotel") || s.includes("hospitality")) {
    return [
      { label: "Working as a chef or baker — cooking amazing food for people", value: "design_visual" },
      { label: "Running or managing a restaurant, hotel, or food outlet", value: "business_money" },
      { label: "Creating new food recipes or products and sharing them", value: "design_visual" },
      { label: "Writing a food blog, doing food photography, or running a food show", value: "media_communication" },
    ];
  }

  if (s.includes("lang") || s.includes("lit") || s.includes("read") || s.includes("write")) {
    return [
      { label: "Writing stories, articles, or books that people love reading", value: "media_communication" },
      { label: "Teaching a language or literature in school or college", value: "helping_teaching" },
      { label: "Researching how languages and stories have changed over history", value: "science_research" },
      { label: "Translating content or working in PR and communications", value: "media_communication" },
    ];
  }

  if (s.includes("comp") || s.includes("tech") || s.includes("code") || s.includes("program") || s.includes("it")) {
    return [
      { label: "Writing code to build apps, programs, or websites", value: "technology_coding" },
      { label: "Designing how apps or games look and feel to the user", value: "design_visual" },
      { label: "Working with AI or smart data systems", value: "numbers_analysis" },
      { label: "Keeping computer networks and systems safe from attacks", value: "building_engineering" },
    ];
  }

  if (s.includes("soci") || s.includes("politic") || s.includes("civic") || s.includes("history") || s.includes("histor")) {
    return [
      { label: "Working in the government or writing policies that help people", value: "law_justice" },
      { label: "Researching how societies and people change over time", value: "science_research" },
      { label: "Helping communities and people who need support (social work)", value: "helping_teaching" },
      { label: "Writing or reporting about politics and social issues", value: "media_communication" },
    ];
  }

  // Dynamic fallback using the custom subject name itself
  const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
  return [
    { label: `Going deep into ${capitalizedSubject} — studying and researching it seriously`, value: "science_research" },
    { label: `Explaining ${capitalizedSubject} to others — teaching or tutoring`, value: "helping_teaching" },
    { label: `Using ${capitalizedSubject} to build or create something real`, value: "building_engineering" },
    { label: `Using ${capitalizedSubject} to run a business or solve a real-world problem`, value: "business_money" },
  ];
}

const COMBINED_SUBJECT_INTERESTS: Record<string, Array<{ label: string; value: string }>> = {
  "Chemistry+Computer Science": [
    { label: "Using AI or code to help discover new medicines and treatments", value: "health_medicine" },
    { label: "Writing programs that simulate how chemicals react with each other", value: "science_research" },
    { label: "Building software for labs or chemical factories", value: "building_engineering" },
    { label: "Finding patterns in chemical data using computers", value: "numbers_analysis" },
  ],
  "Biology+Computer Science": [
    { label: "Using coding to analyse DNA and understand diseases (bioinformatics)", value: "science_research" },
    { label: "Building health apps or medical software for hospitals and patients", value: "health_medicine" },
    { label: "Studying how cells and diseases work by modelling them on a computer", value: "science_research" },
    { label: "Writing software that powers robotic surgery or health gadgets", value: "building_engineering" },
  ],
  "Mathematics+Physics": [
    { label: "Studying the maths behind space, gravity, and the universe", value: "science_research" },
    { label: "Writing the physics that makes a video game simulation feel real", value: "technology_coding" },
    { label: "Using maths to understand how stock markets and economies move", value: "numbers_analysis" },
    { label: "Designing rockets, aircraft, or big structures using physics and maths", value: "building_engineering" },
  ],
  "Computer Science+Mathematics": [
    { label: "Building AI that learns and gets smarter on its own", value: "technology_coding" },
    { label: "Creating secure systems that protect data from hackers", value: "technology_coding" },
    { label: "Analysing large datasets to find useful patterns and trends", value: "numbers_analysis" },
    { label: "Writing mathematical models that predict how financial markets move", value: "business_money" },
  ],
  "Biology+Chemistry": [
    { label: "Developing new vaccines, medicines, or treatments in a lab", value: "health_medicine" },
    { label: "Researching DNA, genetics, and biotech to solve medical problems", value: "science_research" },
    { label: "Testing whether food, soil, or crops are safe and healthy", value: "nature_agriculture" },
    { label: "Using lab tests to help solve crimes (like forensics in crime shows)", value: "science_research" },
  ],
  "Accountancy+Economics": [
    { label: "Reading a company's financial reports and spotting risks", value: "business_money" },
    { label: "Studying bank policies and economic trends that affect everyone's life", value: "numbers_analysis" },
    { label: "Advising companies on taxes, savings, and how to grow", value: "business_money" },
    { label: "Checking if government spending or company accounts follow the rules", value: "law_justice" },
  ],
  "Business Studies+Economics": [
    { label: "Helping a company figure out how to grow and beat competitors", value: "business_money" },
    { label: "Studying why people buy certain products and how prices change", value: "numbers_analysis" },
    { label: "Managing how products move across countries — international trade", value: "business_money" },
    { label: "Writing about economic news or working in public relations", value: "media_communication" },
  ],
  "Chemistry+Physics": [
    { label: "Researching new materials — like making something stronger than steel", value: "science_research" },
    { label: "Working in chemical factories or engineering processes", value: "building_engineering" },
    { label: "Studying pollution, solar energy, or clean water solutions", value: "nature_agriculture" },
    { label: "Teaching chemistry or physics in school or college", value: "helping_teaching" },
  ],
  "Accountancy+Business Studies": [
    { label: "Starting and running a business — managing everything from money to team", value: "business_money" },
    { label: "Reading a company's accounts and checking if the numbers make sense", value: "numbers_analysis" },
    { label: "Helping a company plan for growth — strategy, team culture, and management", value: "helping_teaching" },
    { label: "Making sure a business pays the right taxes and follows financial rules", value: "law_justice" },
  ],
  "Economics+Mathematics": [
    { label: "Using maths to study how prices, income, and economies change", value: "numbers_analysis" },
    { label: "Analysing stock markets and figuring out where to invest money", value: "business_money" },
    { label: "Researching how people's choices affect society and the economy", value: "science_research" },
    { label: "Working in government or designing policies that help the public", value: "law_justice" },
  ],
  "History+English": [
    { label: "Writing stories, articles, or books — fiction or non-fiction", value: "media_communication" },
    { label: "Teaching history, literature, or English in school or college", value: "helping_teaching" },
    { label: "Preparing for civil services (IAS/IPS) or working in public service", value: "law_justice" },
    { label: "Working in museums or preserving historical sites and old records", value: "design_visual" },
  ],
  "English+Psychology": [
    { label: "Writing about mental health topics or editing content that helps people", value: "media_communication" },
    { label: "Counselling students, guiding careers, or teaching", value: "helping_teaching" },
    { label: "Working in HR — selecting people, managing office culture, or PR", value: "business_money" },
    { label: "Working as a psychologist or therapist in a clinic or hospital", value: "health_medicine" },
  ],
};

// Entrance exams differ by stream — a Commerce student should never see NEET/JEE.
const STREAM_EXAMS: Record<Stream, string> = {
  science_bio: "NEET / KEAM",
  science_maths: "JEE / KEAM",
  science_cs: "JEE / KEAM",
  commerce: "CUET / IPMAT",
  humanities: "CUET / CLAT",
};

// Goal choices are stream-aware: the entrance-exam option names only the exams
// that actually apply to the student's stream.
function getGoalChoices(stream: Stream | null): Array<{ label: string; value: string }> {
  const exams = stream ? STREAM_EXAMS[stream] : "JEE / NEET / CUET";
  return [
    { label: "Study a degree (BTech / BSc / BA / BBA / MBBS)", value: "higher_study" },
    { label: `Crack entrance exams this year (${exams})`, value: "entrance_exams" },
    { label: "Repeat a year (Entrance coaching)", value: "repeat_year" },
    { label: "Prepare for govt exams (PSC / UPSC)", value: "government" },
    { label: "Get a job quickly", value: "job_soon" },
    { label: "Start a business or project", value: "business" },
  ];
}

const PRIORITY_CHOICES = [
  { label: "High salary and fast growth", value: "high_salary" },
  { label: "Stable job and security", value: "job_security" },
  { label: "Work I'm passionate about", value: "passion" },
  { label: "Government or public service", value: "government_service" },
];

const BUDGET_CHOICES = [
  { label: "Yes, cost is not a big problem", value: "no_constraint" },
  { label: "Maybe, but it has to be reasonable", value: "medium" },
  { label: "No, we need a low-cost or government college", value: "low" },
];

const LOCATION_CHOICES = [
  { label: "I'd prefer to stay in Kerala", value: "kerala" },
  { label: "I can move anywhere in India", value: "india" },
  { label: "I'm open to studying abroad too", value: "abroad" },
];

const FAMILY_CHOICES = [
  { label: "No, the choice is fully mine", value: "none" },
  { label: "They have a mild preference", value: "some_preference" },
  { label: "Yes, they strongly prefer a certain path", value: "family_preference" },
];

const WORKSTYLE_CHOICES = [
  { label: "With people — talking, helping, leading", value: "social" },
  { label: "On my own — thinking, solving, focusing", value: "analytical_solo" },
  { label: "Hands-on or outdoors — building, moving", value: "practical_outdoor" },
  { label: "A mix of all of these", value: "mixed" },
];

// Maps free-text Q3 answers to the closest interest cluster (client-side, no API needed).
// Used so typed answers also trigger the Q4 secondary interest question.
function detectClusterFromText(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("build") || t.includes("architect") || t.includes("struct") || t.includes("civil") || t.includes("mechanic") || t.includes("construct") || t.includes("engineer")) return "building_engineering";
  if (t.includes("code") || t.includes("program") || t.includes("software") || t.includes("app") || t.includes("web") || t.includes("tech") || t.includes("comput")) return "technology_coding";
  if (t.includes("doctor") || t.includes("medic") || t.includes("health") || t.includes("nurs") || t.includes("hospital") || t.includes("pharma") || t.includes("patient")) return "health_medicine";
  if (t.includes("research") || t.includes("scien") || t.includes("lab") || t.includes("experiment") || t.includes("physics") || t.includes("chem") || t.includes("biolog")) return "science_research";
  if (t.includes("design") || t.includes("art") || t.includes("draw") || t.includes("creat") || t.includes("visual") || t.includes("graphic") || t.includes("paint") || t.includes("sketch")) return "design_visual";
  if (t.includes("business") || t.includes("money") || t.includes("financ") || t.includes("invest") || t.includes("bank") || t.includes("market") || t.includes("trade") || t.includes("entrepreneur") || t.includes("startup")) return "business_money";
  if (t.includes("teach") || t.includes("educat") || t.includes("counsel") || t.includes("social") || t.includes("mentor") || t.includes("help people") || t.includes("guide")) return "helping_teaching";
  if (t.includes("law") || t.includes("legal") || t.includes("court") || t.includes("justice") || t.includes("lawyer") || t.includes("advocate") || t.includes("ips")) return "law_justice";
  if (t.includes("media") || t.includes("journal") || t.includes("writ") || t.includes("news") || t.includes("film") || t.includes("video") || t.includes("content") || t.includes("story")) return "media_communication";
  if (t.includes("farm") || t.includes("nature") || t.includes("agri") || t.includes("forest") || t.includes("environment") || t.includes("plant") || t.includes("animal") || t.includes("wildlife")) return "nature_agriculture";
  if (t.includes("army") || t.includes("defence") || t.includes("military") || t.includes("police") || t.includes("nda") || t.includes("sport") || t.includes("adventur") || t.includes("soldier")) return "defence_adventure";
  if (t.includes("math") || t.includes("number") || t.includes("data") || t.includes("statistic") || t.includes("analys") || t.includes("account") || t.includes("calcul")) return "numbers_analysis";
  return null;
}

// Secondary interest choices shown after Q3 — drills into what aspect of the
// selected cluster appeals most. Keys match the 12 interest cluster IDs.
const SECONDARY_INTEREST_CHOICES: Record<string, Array<{ label: string; value: string }>> = {
  building_engineering: [
    { label: "Designing what a building looks like — shapes, rooms, and style", value: "design_visual" },
    { label: "Using maths to make sure a building stands strong and safe", value: "numbers_analysis" },
    { label: "Coding apps or software for machines and factories", value: "technology_coding" },
    { label: "Managing a building project — workers, schedule, and budget", value: "business_money" },
  ],
  technology_coding: [
    { label: "Building apps, games, or websites that people love using", value: "design_visual" },
    { label: "Working with AI, data, or making computers smarter", value: "numbers_analysis" },
    { label: "Keeping systems safe from hackers — cyber security", value: "building_engineering" },
    { label: "Starting a tech company or building my own product", value: "business_money" },
  ],
  health_medicine: [
    { label: "Treating sick people directly — as a doctor, nurse, or physio", value: "health_medicine" },
    { label: "Finding new medicines or cures for diseases in a lab", value: "science_research" },
    { label: "Helping people feel better mentally — counselling or psychology", value: "helping_teaching" },
    { label: "Running a hospital or managing health services", value: "business_money" },
  ],
  science_research: [
    { label: "Doing experiments in a lab — chemistry, biology, or physics", value: "science_research" },
    { label: "Studying nature, climate change, or the environment", value: "nature_agriculture" },
    { label: "Researching maths, AI, or computer science", value: "numbers_analysis" },
    { label: "Teaching science or sharing discoveries with others", value: "helping_teaching" },
  ],
  design_visual: [
    { label: "Making logos, posters, or designs for brands", value: "design_visual" },
    { label: "Designing apps or websites that look good and work well", value: "technology_coding" },
    { label: "Creating videos, reels, or short films", value: "media_communication" },
    { label: "Designing buildings, rooms, or clothes and fashion", value: "building_engineering" },
  ],
  business_money: [
    { label: "Starting my own business or startup from scratch", value: "business_money" },
    { label: "Managing company money — banking, finance, or investments", value: "numbers_analysis" },
    { label: "Marketing and selling products or ideas to people", value: "media_communication" },
    { label: "Managing a team or helping a company grow", value: "helping_teaching" },
  ],
  helping_teaching: [
    { label: "Teaching students in a school or college", value: "helping_teaching" },
    { label: "Listening to people's problems and helping them feel better", value: "health_medicine" },
    { label: "Helping families or communities who are struggling", value: "helping_teaching" },
    { label: "Training or coaching people to get better at their job", value: "business_money" },
  ],
  law_justice: [
    { label: "Arguing cases and winning in court as a lawyer", value: "law_justice" },
    { label: "Working in the police or crime investigation", value: "defence_adventure" },
    { label: "Working in government or writing laws that help people", value: "law_justice" },
    { label: "Helping companies handle legal deals and agreements", value: "business_money" },
  ],
  media_communication: [
    { label: "Writing news stories, scripts, or creative content", value: "media_communication" },
    { label: "Making YouTube videos, short films, or reels", value: "design_visual" },
    { label: "Working in advertising or promoting brands", value: "business_money" },
    { label: "Hosting a show, podcast, or speaking in front of people", value: "media_communication" },
  ],
  nature_agriculture: [
    { label: "Working on farms or with crops and plant science", value: "nature_agriculture" },
    { label: "Protecting wildlife, forests, or the environment", value: "science_research" },
    { label: "Taking care of sick animals — vet work", value: "health_medicine" },
    { label: "Starting a food or farming business", value: "business_money" },
  ],
  defence_adventure: [
    { label: "Joining the Army, Navy, or Air Force as an officer", value: "defence_adventure" },
    { label: "Working in the police or protecting the country's borders", value: "law_justice" },
    { label: "Outdoor adventure — trekking, mountaineering, or survival", value: "defence_adventure" },
    { label: "Coaching a sports team or teaching physical education", value: "helping_teaching" },
  ],
  numbers_analysis: [
    { label: "Finding patterns in data and making graphs or predictions", value: "numbers_analysis" },
    { label: "Managing money in banking, finance, or the stock market", value: "business_money" },
    { label: "Doing research in maths or physics", value: "science_research" },
    { label: "Coding for AI, machine learning, or data tools", value: "technology_coding" },
  ],
};

const TOTAL_QUESTIONS = 11;

// ── UI-only icon maps (Icons8 3D Fluency) ─────────────────────────────────
const i8 = (n: string) => `https://img.icons8.com/3d-fluency/96/${n}.png`;
const STREAM_ICONS: Record<string, string> = {
  science_bio: i8("microscope"), science_maths: i8("math"), science_cs: i8("laptop"),
  commerce: i8("combo-chart"), humanities: i8("paint-palette"),
};
const GOAL_ICONS: Record<string, string> = {
  higher_study: i8("graduation-cap"), entrance_exams: i8("trophy"), repeat_year: i8("books"),
  government: i8("bank"), job_soon: i8("briefcase"), business: i8("rocket"),
};
const PRIORITY_ICONS: Record<string, string> = {
  high_salary: i8("money-bag"), job_security: i8("shield"),
  passion: i8("like"), government_service: i8("bank"),
};
const BUDGET_ICONS: Record<string, string> = {
  no_constraint: i8("money-bag"), medium: i8("wallet"), low: i8("money-box"),
};
const LOCATION_ICONS: Record<string, string> = {
  kerala: i8("home"), india: i8("globe"), abroad: i8("airplane-take-off"),
};
const FAMILY_ICONS: Record<string, string> = {
  none: i8("user-male-circle"), some_preference: i8("conference-call"), family_preference: i8("people"),
};
const WORKSTYLE_ICONS: Record<string, string> = {
  social: i8("conference-call"), analytical_solo: i8("brain"),
  practical_outdoor: i8("maintenance"), mixed: i8("puzzle"),
};

// ── Types ────────────────────────────────────────────────────────────────────

type Phase = "questions" | "loading" | "result";

type MiniRecCourse = {
  courseId: string;
  name: string;       // course name — the next step to take
  leadsTo: string;    // career this course leads toward
  domain: string;
  fitScore: number;
  confidence: number;
};

type MiniRecResult = {
  top: MiniRecCourse[];
  overallConfidence: number;
};

const DOMAIN_COLORS: Record<string, string> = {
  "Health & Medicine": "bg-rose-400",
  "Technology": "bg-violet-400",
  "Technology & Computing": "bg-violet-400",
  "Business & Finance": "bg-amber-400",
  "Science & Research": "bg-cyan-400",
  "Engineering": "bg-blue-400",
  "Design & Media": "bg-pink-400",
  "Law & Justice": "bg-indigo-400",
  "Education & Social Work": "bg-green-400",
  "Agriculture & Nature": "bg-emerald-400",
  "Defence & Security": "bg-slate-400",
};

function domainColor(domain: string): string {
  return DOMAIN_COLORS[domain] ?? "bg-primary";
}

function getCareerIcon(name: string, domain: string): string {
  const n = name.toLowerCase();
  const d = domain.toLowerCase();

  // Keyword match on career name
  if (n.includes("cloud") || n.includes("network") || n.includes("system administrator")) {
    return "https://img.icons8.com/3d-fluency/96/cloud.png";
  }
  if (n.includes("cyber") || n.includes("security") || n.includes("ethical hacker")) {
    return "https://img.icons8.com/3d-fluency/96/shield.png";
  }
  if (n.includes("operation") || n.includes("manager") || n.includes("business analyst") || n.includes("project manager") || n.includes("consultant")) {
    return "https://img.icons8.com/3d-fluency/96/briefcase.png";
  }
  if (n.includes("developer") || n.includes("programmer") || n.includes("software") || n.includes("web") || n.includes("app")) {
    return "https://img.icons8.com/3d-fluency/96/code.png";
  }
  if (n.includes("data scientist") || n.includes("data analyst") || n.includes("database") || n.includes("ai") || n.includes("machine learning")) {
    return "https://img.icons8.com/3d-fluency/96/database.png";
  }
  if (n.includes("coach") || n.includes("sport") || n.includes("instructor") || n.includes("athlet")) {
    return "https://img.icons8.com/3d-fluency/96/football.png";
  }
  if (n.includes("trainer") || n.includes("gym") || n.includes("fitness")) {
    return "https://img.icons8.com/3d-fluency/96/dumbbell.png";
  }
  if (n.includes("chef") || n.includes("baker") || n.includes("pastry") || n.includes("cooking") || n.includes("cook")) {
    return "https://img.icons8.com/3d-fluency/96/croissant.png";
  }
  if (n.includes("food") || n.includes("restaurant") || n.includes("hotel") || n.includes("catering")) {
    return "https://img.icons8.com/3d-fluency/96/restaurant.png";
  }
  if (n.includes("photographer") || n.includes("videographer") || n.includes("camera") || n.includes("media") || n.includes("journalist")) {
    return "https://img.icons8.com/3d-fluency/96/camera.png";
  }
  if (n.includes("doctor") || n.includes("physician") || n.includes("surgeon") || n.includes("nurse") || n.includes("medical") || n.includes("clinical")) {
    return "https://img.icons8.com/3d-fluency/96/hospital.png";
  }
  if (n.includes("research") || n.includes("scientist") || n.includes("chemist") || n.includes("physicist")) {
    return "https://img.icons8.com/3d-fluency/96/test-tube.png";
  }
  if (n.includes("design") || n.includes("ui") || n.includes("ux") || n.includes("artist") || n.includes("creative") || n.includes("illustrator")) {
    return "https://img.icons8.com/3d-fluency/96/paint-palette.png";
  }
  if (n.includes("law") || n.includes("advocate") || n.includes("judge") || n.includes("legal")) {
    return "https://img.icons8.com/3d-fluency/96/scales.png";
  }
  if (n.includes("teacher") || n.includes("professor") || n.includes("educat") || n.includes("trainer") || n.includes("tutor")) {
    return "https://img.icons8.com/3d-fluency/96/graduation-cap.png";
  }

  // Fallback by domain
  if (d.includes("tech") || d.includes("comput")) {
    return "https://img.icons8.com/3d-fluency/96/code.png";
  }
  if (d.includes("business") || d.includes("finance") || d.includes("management")) {
    return "https://img.icons8.com/3d-fluency/96/briefcase.png";
  }
  if (d.includes("science") || d.includes("research")) {
    return "https://img.icons8.com/3d-fluency/96/test-tube.png";
  }
  if (d.includes("health") || d.includes("med")) {
    return "https://img.icons8.com/3d-fluency/96/hospital.png";
  }
  if (d.includes("design") || d.includes("media") || d.includes("art")) {
    return "https://img.icons8.com/3d-fluency/96/paint-palette.png";
  }
  if (d.includes("law") || d.includes("justice")) {
    return "https://img.icons8.com/3d-fluency/96/scales.png";
  }
  if (d.includes("education") || d.includes("social")) {
    return "https://img.icons8.com/3d-fluency/96/graduation-cap.png";
  }
  if (d.includes("nature") || d.includes("agri")) {
    return "https://img.icons8.com/3d-fluency/96/sprout.png";
  }
  if (d.includes("hospitality") || d.includes("hotel") || d.includes("food") || d.includes("culinary")) {
    return "https://img.icons8.com/3d-fluency/96/restaurant.png";
  }
  if (d.includes("defence") || d.includes("security")) {
    return "https://img.icons8.com/3d-fluency/96/shield.png";
  }

  return "https://img.icons8.com/3d-fluency/96/star.png";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function StartPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("questions");
  const [qIndex, setQIndex] = useState(0);
  const [stream, setStream] = useState<Stream | null>(null);
  const [selectedSubjectsList, setSelectedSubjectsList] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

  // Q0: name + age + phone + gender
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  // Q1: stream + percentage
  const [percentage, setPercentage] = useState("");

  // Q2: subject multi-select
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());

  // Free-text input (Q2–Q5)
  const [textVal, setTextVal] = useState("");
  const textRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [miniRec, setMiniRec] = useState<MiniRecResult | null>(null);
  const [recError, setRecError] = useState(false);

  // AI-generated Q3 choices — generated fresh from the student's subjects every time
  // (the hardcoded maps below are only a silent fallback if the AI call fails).
  const [aiQ3, setAiQ3] = useState<{ question: string; choices: Array<{ label: string; value: string }> } | null>(null);
  const [q3LoadingAI, setQ3LoadingAI] = useState(false);

  // AI-generated Q4 choices — drill deeper into the cluster picked at Q3.
  const [aiQ4, setAiQ4] = useState<{ question: string; choices: Array<{ label: string; value: string }> } | null>(null);
  const [q4LoadingAI, setQ4LoadingAI] = useState(false);

  // Inline validation errors for Q0 and Q1
  const [q0Errors, setQ0Errors] = useState<{ name?: string; age?: string; phone?: string; gender?: string }>({});
  const [pctError, setPctError] = useState<string | null>(null);

  // Tracks which cluster the student picked at Q3 — used to fetch the right Q4 choices.
  // A ref is used alongside state so advance() sees the correct value even inside
  // async closures (state captured at call time vs ref always reads current value).
  const q3ClusterRef = useRef<string | null>(null);
  const [q3Cluster, setQ3Cluster] = useState<string | null>(null);
  // The exact activity phrase the student picked at Q3 — passed to the Q4 AI prompt
  // so the deeper question is grounded in what they actually chose.
  const q3ActivityRef = useRef<string | null>(null);

  // Animate question transitions
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (qIndex === 5) {
      const lower = textVal.toLowerCase();
      if (lower.includes("repeat") || lower.includes("re-use") || lower.includes("drop") || lower.includes("one year") || lower.includes("coaching")) {
        setInfoMessage("Taking a drop/repeat year to prep for JEE/NEET/KEAM is challenging but very rewarding. We'll adjust your path to focus on cracking these exams!");
      } else if (lower.includes("jee") || lower.includes("neet") || lower.includes("keam") || lower.includes("entrance") || lower.includes("iit") || lower.includes("aiims")) {
        setInfoMessage("Aptitude is key for cracking entrance exams! We'll make sure your report highlights paths aligned with engineering and medical streams.");
      } else {
        setInfoMessage(null);
      }
    } else {
      setInfoMessage(null);
    }
  }, [textVal, qIndex]);

  useEffect(() => {
    fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ source: "start_quiz" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.sessionId) setSessionId(d.sessionId);
        else setSessionError(true);
      })
      .catch(() => setSessionError(true));
  }, []);

  function getLabel() {
    return [
      "About You", "Your Stream", "Your Subjects", "Your Interests", "Your Direction",
      "Your Goal", "Your Priorities", "Your Budget", "Your Location", "Your Family", "Your Work Style",
    ][qIndex] ?? "";
  }

  function getQuestion() {
    switch (qIndex) {
      case 0: return "Hey there! Let's get started. What is your name, age, and phone number?";
      case 1: return "Which stream are you studying in Plus Two?";
      case 2: return "Which subjects do you enjoy the most or score best in? (pick up to 2)";
      case 3: return aiQ3?.question ?? "Would you be interested in any of these?";
      case 4: return aiQ4?.question ?? "Nice! Which of these sounds most like what you'd love doing?";
      case 5: return "What are you planning to do after Plus Two?";
      case 6: return "What matters most to you when choosing a career?";
      case 7: return "Can your family comfortably pay for a private college if needed?";
      case 8: return "Are you open to moving to another city or abroad to study?";
      case 9: return "Does your family have a strong preference about your career?";
      case 10: return "How do you most enjoy working?";
      default: return "";
    }
  }

  function getChoices() {
    const s = stream ?? "science_bio";
    switch (qIndex) {
      case 2: return SUBJECT_CHOICES[s];
      case 3: {
        // Use AI-generated choices if available (typed subject or unknown subject)
        if (aiQ3) {
          return aiQ3.choices.map((c, idx) => ({ label: c.label, value: `${c.value}::${idx}` }));
        }

        let baseChoices: Array<{ label: string; value: string }> = [];
        if (selectedSubjectsList.length > 0) {
          if (selectedSubjectsList.length === 1) {
            baseChoices = getDynamicInterestChoices(selectedSubjectsList[0], s);
          } else {
            const comboKey = [...selectedSubjectsList].sort().join("+");
            if (COMBINED_SUBJECT_INTERESTS[comboKey]) {
              baseChoices = COMBINED_SUBJECT_INTERESTS[comboKey];
            } else {
              const choices1 = getDynamicInterestChoices(selectedSubjectsList[0], s);
              const choices2 = getDynamicInterestChoices(selectedSubjectsList[1], s);
              const interleaved: Array<{ label: string; value: string }> = [];
              const maxLen = Math.max(choices1.length, choices2.length);
              for (let i = 0; i < maxLen; i++) {
                if (choices1[i]) interleaved.push(choices1[i]);
                if (choices2[i]) interleaved.push(choices2[i]);
              }
              const seen = new Set<string>();
              const merged: Array<{ label: string; value: string }> = [];
              for (const c of interleaved) {
                const key = c.label.toLowerCase() + "::" + c.value;
                if (!seen.has(key)) { seen.add(key); merged.push(c); }
              }
              baseChoices = merged;
            }
          }
        } else {
          baseChoices = INTEREST_CHOICES[s];
        }

        return baseChoices.slice(0, 6).map((c, idx) => ({ label: c.label, value: `${c.value}::${idx}` }));
      }
      case 4: {
        // Prefer AI-generated deeper choices; fall back to the hardcoded map only
        // if the AI call failed.
        if (aiQ4) {
          return aiQ4.choices.map((c, idx) => ({ label: c.label, value: `${c.value}::${idx}` }));
        }
        const cluster = q3Cluster;
        if (cluster && SECONDARY_INTEREST_CHOICES[cluster]) {
          return SECONDARY_INTEREST_CHOICES[cluster];
        }
        return [];
      }
      case 5: return getGoalChoices(stream);
      case 6: return PRIORITY_CHOICES;
      case 7: return BUDGET_CHOICES;
      case 8: return LOCATION_CHOICES;
      case 9: return FAMILY_CHOICES;
      case 10: return WORKSTYLE_CHOICES;
      default: return [];
    }
  }

  function getTextPlaceholder() {
    switch (qIndex) {
      case 2: return "e.g. Applied Statistics, Physical Education…";
      case 3: return "e.g. I love designing posters, writing stories…";
      case 5: return "e.g. I want to go abroad for studies…";
      case 6: return "e.g. Work-life balance matters most to me…";
      default: return "Type your answer…";
    }
  }

  function toggleSubject(value: string) {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        if (next.size >= 2) {
          const first = next.values().next().value as string;
          next.delete(first);
        }
        next.add(value);
      }
      return next;
    });
  }

  async function postAnswer(opts: {
    value?: string;
    values?: string[];
    text?: string;
    name?: string;
    age?: number;
    phone?: string;
    gender?: string;
    percentage?: number;
    isChoice: boolean;
  }) {
    if (!sessionId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, questionIndex: qIndex, ...opts }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
      return;
    }
    advance();
  }

  function advance() {
    setVisible(false);
    setTimeout(() => {
      if (qIndex < TOTAL_QUESTIONS - 1) {
        const nextQ = qIndex + 1;
        // Q4 requires a cluster chip picked in Q3. If the student typed a free-text
        // answer instead, q3ClusterRef is null — skip Q4 and go straight to Q5 (goal).
        const jumpTo = nextQ === 4 && q3ClusterRef.current === null ? 5 : nextQ;
        setQIndex(jumpTo);
        setSelectedSubjects(new Set());
        setSelectedInterests(new Set());
        setTextVal("");
        setInfoMessage(null);
        setVisible(true);
        setBusy(false);
      } else {
        setBusy(false);
        setPhase("loading");
        fetchMiniRec();
      }
    }, 220);
  }

  async function fetchMiniRec() {
    if (!sessionId) return;
    try {
      const res = await fetch("/api/mini-recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error("Failed");
      const data: MiniRecResult = await res.json();
      setMiniRec(data);
      setPhase("result");
    } catch {
      setRecError(true);
      setPhase("result");
    }
  }

  // Q0: name + age continue
  function onNameAgeContinue() {
    const parsedAge = parseInt(age, 10);
    const errors: { name?: string; age?: string; phone?: string; gender?: string } = {};
    if (!name.trim() || name.trim().length < 2) errors.name = "Please enter your name (at least 2 letters)";
    if (!age || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 30) errors.age = "Please enter a valid age between 10 and 30";
    if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9";
    if (!gender) errors.gender = "Please select your gender";
    if (Object.keys(errors).length > 0) { setQ0Errors(errors); return; }
    setQ0Errors({});
    void postAnswer({ name: name.trim(), age: parsedAge, phone: phone.trim(), gender, isChoice: false });
  }

  // Q1: stream + percentage continue
  function onStreamContinue() {
    if (!stream) return;
    const pct = parseFloat(percentage);
    if (!percentage.trim() || isNaN(pct) || pct < 0 || pct > 100) {
      setPctError("Please enter your Plus Two percentage (0–100)");
      return;
    }
    setPctError(null);
    void postAnswer({ value: stream, percentage: pct, isChoice: true });
  }

  async function fetchAiQ3(subjects: string[], typedText: string, streamVal: string) {
    const subjectList = typedText.trim() ? [typedText.trim()] : subjects;
    setAiQ3(null);
    setQ3LoadingAI(true);
    try {
      const res = await fetch("/api/q3choices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, stream: streamVal, subjects: subjectList }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json() as { question: string; choices: Array<{ label: string; value: string }> };
      setAiQ3(data);
    } catch {
      // silently fall back to hardcoded choices
    } finally {
      setQ3LoadingAI(false);
    }
  }

  // Fetch deeper Q4 choices for the cluster the student leaned toward at Q3.
  // Falls back silently to the hardcoded SECONDARY_INTEREST_CHOICES map on failure.
  async function fetchAiQ4(primaryCluster: string, q3Activity: string) {
    if (!sessionId || !stream) return;
    setAiQ4(null);
    setQ4LoadingAI(true);
    try {
      const res = await fetch("/api/q4choices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId,
          stream,
          subjects: selectedSubjectsList,
          primaryCluster,
          q3Activity,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json() as { question: string; choices: Array<{ label: string; value: string }> };
      setAiQ4(data);
    } catch {
      // silently fall back to hardcoded secondary choices
    } finally {
      setQ4LoadingAI(false);
    }
  }

  function onSubjectContinue() {
    if (selectedSubjects.size === 0 && !textVal.trim()) return;
    const typed = textVal.trim();
    const selected = Array.from(selectedSubjects);
    if (typed && selectedSubjects.size === 0) {
      setSelectedSubjectsList([typed]);
      void postAnswer({ text: typed, isChoice: false });
    } else if (selectedSubjects.size > 0) {
      setSelectedSubjectsList(selected);
      void postAnswer({ values: selected, isChoice: true });
    }
    // Always generate Q3 choices with AI, grounded in what they picked/typed.
    if (sessionId && stream) {
      void fetchAiQ3(selected, typed, stream);
    }
  }

  function onInterestContinue() {
    if (selectedInterests.size === 0 && !textVal.trim()) return;
    if (textVal.trim() && selectedInterests.size === 0) {
      void postAnswer({ text: textVal.trim(), isChoice: false });
    } else if (selectedInterests.size > 0) {
      void postAnswer({ values: Array.from(selectedInterests), isChoice: true });
    }
  }

  function toggleInterest(value: string) {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function onChoiceClick(value: string) {
    if (qIndex === 2) {
      toggleSubject(value);
      return; // subjects need explicit Continue
    }
    if (qIndex === 3) {
      const rawCluster = value.split("::")[0];
      const activity = getChoices().find((c) => c.value === value)?.label ?? "";
      q3ClusterRef.current = rawCluster;
      q3ActivityRef.current = activity;
      setQ3Cluster(rawCluster);
      // Kick off the deeper Q4 choices now so they're ready by the time we advance.
      void fetchAiQ4(rawCluster, activity);
      void postAnswer({ value, isChoice: true });
      return;
    }
    if (qIndex === 4) {
      // Secondary interest — click to advance, no delay needed
      void postAnswer({ value, isChoice: true });
      return;
    }
    if (qIndex === 5) {
      if (value === "repeat_year") {
        setInfoMessage("Taking a drop/repeat year to prep for JEE/NEET/KEAM is challenging but very rewarding. We'll adjust your path to focus on cracking these exams!");
      } else if (value === "entrance_exams") {
        const exams = stream ? STREAM_EXAMS[stream] : "your entrance exams";
        setInfoMessage(`Aptitude is key for cracking entrance exams! We'll focus your report on paths that need ${exams}.`);
      } else {
        setInfoMessage(null);
      }

      // Delay advance slightly so they can read the message
      setBusy(true);
      setTimeout(() => {
        void postAnswer({ value, isChoice: true });
      }, 3000);
      return;
    }
    void postAnswer({ value, isChoice: true });
  }

  function onTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = textVal.trim();
    if (!t || busy) return;
    if (qIndex === 2) {
      setSelectedSubjectsList([t]);
    }
    if (qIndex === 3) {
      // Detect cluster from typed text so Q4 deeper choices can show
      const detected = detectClusterFromText(t);
      if (detected) {
        q3ClusterRef.current = detected;
        q3ActivityRef.current = t;
        setQ3Cluster(detected);
        void fetchAiQ4(detected, t);
      }
    }
    void postAnswer({ text: t, isChoice: false });
  }

  const nameAgeValid = name.trim().length >= 2 && parseInt(age, 10) >= 10 && parseInt(age, 10) <= 30 && /^[6-9]\d{9}$/.test(phone) && !!gender;
  const streamPctValid = !!stream && parseFloat(percentage) >= 0 && parseFloat(percentage) <= 100;

  if (sessionError) {
    return (
      <div
        className="flex h-screen flex-col items-center justify-center gap-5 px-6 text-center"
        style={{ background: "#F8F3EC" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://img.icons8.com/3d-fluency/96/disappointed.png" alt="" width={64} height={64} />
        <div className="clay-card w-full max-w-xs p-6">
          <p className="mb-4 text-sm font-semibold" style={{ color: "#374151" }}>
            Could not start a session. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="clay-btn w-full text-sm"
            style={{ height: 48 }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#F8F3EC" }}>
      <style>{`
        @keyframes cta-pulse-glow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 0px #061A8A, 0 8px 24px rgba(30,111,255,0.3);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 4px 0px #061A8A, 0 16px 36px rgba(30,111,255,0.55);
          }
        }
        .cta-glow-pulse {
          animation: cta-pulse-glow 2s infinite ease-in-out;
        }
      `}</style>

      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(248,243,236,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(30,111,255,0.07)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <div
              style={{
                width: 30, height: 30, borderRadius: 10,
                background: "linear-gradient(145deg, #3B82FF, #1E6FFF)",
                boxShadow: "0 3px 0 rgba(6,26,138,0.4), 0 6px 16px rgba(30,111,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 12 }}>P</span>
            </div>
            <span className="text-sm font-black tracking-tight" style={{ color: "#111827" }}>
              PathFinder
            </span>
          </Link>
          {phase === "questions" && (
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: "rgba(30,111,255,0.09)", color: "#1E6FFF" }}
            >
              {qIndex + 1} / {TOTAL_QUESTIONS}
            </span>
          )}
        </div>
      </header>

      {/* ── Progress bar ── */}
      {phase === "questions" && (
        <div className="px-5 pt-4 pb-1">
          <div className="mx-auto flex max-w-lg gap-2">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <div
                key={i}
                className="transition-all duration-500"
                style={{
                  height: 6,
                  flex: 1,
                  borderRadius: 99,
                  background:
                    i < qIndex
                      ? "#1E6FFF"
                      : i === qIndex
                      ? "rgba(30,111,255,0.35)"
                      : "rgba(30,111,255,0.1)",
                  boxShadow: i < qIndex ? "0 2px 8px rgba(30,111,255,0.3)" : "none",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-6">

        {/* ── Questions Phase ── */}
        {phase === "questions" && (
          <div
            className="flex flex-1 flex-col gap-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.22s ease, transform 0.22s ease",
            }}
          >
            {/* Question heading card */}
            <div className="clay-card px-6 pt-6 pb-5">
              <p
                className="mb-1.5 text-[11px] font-black uppercase tracking-[0.12em]"
                style={{ color: "#1E6FFF" }}
              >
                {getLabel()}
              </p>
              <h2
                className="text-xl font-bold leading-snug sm:text-2xl"
                style={{ color: "#111827" }}
              >
                {getQuestion()}
              </h2>
            </div>

            {/* Q0: Name + Age + Phone */}
            {qIndex === 0 && (
              <div className="clay-card p-6 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold" style={{ color: "#6B7280" }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (q0Errors.name) setQ0Errors((prev) => ({ ...prev, name: undefined })); }}
                    placeholder="e.g. Akhil Kumar"
                    autoFocus
                    className="w-full px-4 py-3.5 text-sm outline-none placeholder:text-gray-400 transition-all"
                    style={{ borderRadius: 16, border: q0Errors.name ? "1.5px solid #EF4444" : "1.5px solid rgba(30,111,255,0.15)", background: "#F4F6FB", color: "#111827" }}
                    onFocus={(e) => { e.target.style.borderColor = q0Errors.name ? "#EF4444" : "#1E6FFF"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = q0Errors.name ? "#EF4444" : "rgba(30,111,255,0.15)"; e.target.style.background = "#F4F6FB"; e.target.style.boxShadow = "none"; }}
                  />
                  {q0Errors.name && <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>{q0Errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-xs font-bold" style={{ color: "#6B7280" }}>Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => { setAge(e.target.value); if (q0Errors.age) setQ0Errors((prev) => ({ ...prev, age: undefined })); }}
                      placeholder="e.g. 17"
                      min={10}
                      max={30}
                      className="w-full px-4 py-3.5 text-sm outline-none placeholder:text-gray-400 transition-all"
                      style={{ borderRadius: 16, border: q0Errors.age ? "1.5px solid #EF4444" : "1.5px solid rgba(30,111,255,0.15)", background: "#F4F6FB", color: "#111827" }}
                      onFocus={(e) => { e.target.style.borderColor = q0Errors.age ? "#EF4444" : "#1E6FFF"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.1)"; }}
                      onBlur={(e) => { e.target.style.borderColor = q0Errors.age ? "#EF4444" : "rgba(30,111,255,0.15)"; e.target.style.background = "#F4F6FB"; e.target.style.boxShadow = "none"; }}
                    />
                    {q0Errors.age && <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>{q0Errors.age}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold" style={{ color: "#6B7280" }}>Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); if (q0Errors.phone) setQ0Errors((prev) => ({ ...prev, phone: undefined })); }}
                      placeholder="9XXXXXXXXX"
                      inputMode="numeric"
                      className="w-full px-4 py-3.5 text-sm outline-none placeholder:text-gray-400 transition-all"
                      style={{ borderRadius: 16, border: q0Errors.phone ? "1.5px solid #EF4444" : "1.5px solid rgba(30,111,255,0.15)", background: "#F4F6FB", color: "#111827" }}
                      onFocus={(e) => { e.target.style.borderColor = q0Errors.phone ? "#EF4444" : "#1E6FFF"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.1)"; }}
                      onBlur={(e) => { e.target.style.borderColor = q0Errors.phone ? "#EF4444" : "rgba(30,111,255,0.15)"; e.target.style.background = "#F4F6FB"; e.target.style.boxShadow = "none"; }}
                    />
                    {q0Errors.phone && <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>{q0Errors.phone}</p>}
                  </div>
                </div>
                <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
                  Your number is only used to share your report with a counsellor.
                </p>
                <div>
                  <label className="mb-2 block text-xs font-bold" style={{ color: "#6B7280" }}>Gender</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" },
                      { label: "Prefer not to say", value: "prefer_not_to_say" },
                    ].map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => { setGender(g.value); if (q0Errors.gender) setQ0Errors((prev) => ({ ...prev, gender: undefined })); }}
                        className="px-3 py-2.5 text-xs font-semibold transition-all"
                        style={{
                          borderRadius: 14,
                          border: gender === g.value ? "1.5px solid #1E6FFF" : "1.5px solid rgba(30,111,255,0.15)",
                          background: gender === g.value ? "linear-gradient(135deg, #EEF4FF 0%, #D9E9FF 100%)" : "#F4F6FB",
                          color: gender === g.value ? "#1E6FFF" : "#374151",
                        }}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                  {q0Errors.gender && <p className="mt-2 text-xs" style={{ color: "#EF4444" }}>{q0Errors.gender}</p>}
                </div>
                <button
                  disabled={busy}
                  onClick={onNameAgeContinue}
                  className="clay-btn w-full text-sm"
                  style={{ height: 52 }}
                >
                  {busy ? "Saving…" : "Continue →"}
                </button>
              </div>
            )}

            {/* Q1: Stream cards + percentage */}
            {qIndex === 1 && (
              <div className="flex flex-col gap-3">
                <div className="clay-card p-4 space-y-2">
                  {STREAM_CHOICES.map((c) => (
                    <button
                      key={c.value}
                      disabled={busy}
                      onClick={() => setStream(c.value as Stream)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold focus:outline-none transition-all duration-150 disabled:cursor-not-allowed"
                      style={{
                        borderRadius: 18,
                        border: stream === c.value ? "1.5px solid #1E6FFF" : "1.5px solid rgba(30,111,255,0.1)",
                        background: stream === c.value ? "linear-gradient(135deg, #EEF4FF 0%, #D9E9FF 100%)" : "#F4F6FB",
                        color: stream === c.value ? "#1E6FFF" : "#374151",
                        boxShadow: stream === c.value ? "0 2px 0 rgba(30,111,255,0.15), 0 4px 16px rgba(30,111,255,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
                        transform: stream === c.value ? "scale(1.01)" : "scale(1)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={STREAM_ICONS[c.value] ?? i8("book")} alt="" width={28} height={28} className="shrink-0" />
                      <span className="flex-1">{c.label}</span>
                      {stream === c.value && (
                        <span className="shrink-0 text-sm font-bold" style={{ color: "#1E6FFF" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="clay-card p-5 space-y-3">
                  <div>
                    <label className="mb-2 block text-xs font-bold" style={{ color: "#6B7280" }}>
                      Plus Two percentage (%)
                    </label>
                    <input
                      type="number"
                      value={percentage}
                      onChange={(e) => { setPercentage(e.target.value); if (pctError) setPctError(null); }}
                      placeholder="e.g. 70"
                      min={0}
                      max={100}
                      step="0.01"
                      className="w-full px-4 py-3.5 text-sm outline-none placeholder:text-gray-400 transition-all"
                      style={{ borderRadius: 16, border: pctError ? "1.5px solid #EF4444" : "1.5px solid rgba(30,111,255,0.15)", background: "#F4F6FB", color: "#111827" }}
                      onFocus={(e) => { e.target.style.borderColor = pctError ? "#EF4444" : "#1E6FFF"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(30,111,255,0.1)"; }}
                      onBlur={(e) => { e.target.style.borderColor = pctError ? "#EF4444" : "rgba(30,111,255,0.15)"; e.target.style.background = "#F4F6FB"; e.target.style.boxShadow = "none"; }}
                    />
                    {pctError && <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>{pctError}</p>}
                  </div>
                  {stream && (
                    <button
                      disabled={busy}
                      onClick={onStreamContinue}
                      className="clay-btn w-full text-sm"
                      style={{ height: 52 }}
                    >
                      {busy ? "Saving…" : "Continue →"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Q3 / Q4 AI loading state */}
            {((qIndex === 3 && q3LoadingAI) || (qIndex === 4 && q4LoadingAI)) && (
              <div className="clay-card p-6 flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Finding the best options for you…</p>
              </div>
            )}

            {/* Q2–Q5: Choice buttons */}
            {qIndex >= 2 && !(qIndex === 3 && q3LoadingAI) && !(qIndex === 4 && q4LoadingAI) && (
              <div className="clay-card p-4 space-y-2">
                {getChoices().map((c, i) => {
                  const isSelected =
                    (qIndex === 2 && selectedSubjects.has(c.value)) ||
                    (qIndex === 3 && selectedInterests.has(c.value));
                  const iconMap: Record<number, Record<string, string>> = {
                    5: GOAL_ICONS, 6: PRIORITY_ICONS, 7: BUDGET_ICONS,
                    8: LOCATION_ICONS, 9: FAMILY_ICONS, 10: WORKSTYLE_ICONS,
                  };
                  const iconToShow = iconMap[qIndex] ? (iconMap[qIndex][c.value] ?? i8("star")) : null;

                  return (
                    <button
                      key={`${qIndex}-${c.value}-${i}`}
                      disabled={busy}
                      onClick={() => onChoiceClick(c.value)}
                      className="w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-semibold focus:outline-none transition-all duration-150 disabled:cursor-not-allowed"
                      style={{
                        borderRadius: 18,
                        border: isSelected ? "1.5px solid #1E6FFF" : "1.5px solid rgba(30,111,255,0.1)",
                        background: isSelected ? "linear-gradient(135deg, #EEF4FF 0%, #D9E9FF 100%)" : "#F4F6FB",
                        color: isSelected ? "#1E6FFF" : "#374151",
                        boxShadow: isSelected ? "0 2px 0 rgba(30,111,255,0.15), 0 4px 16px rgba(30,111,255,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
                        opacity: busy && !isSelected ? 0.6 : 1,
                      }}
                    >
                      {iconToShow && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={iconToShow} alt="" width={28} height={28} className="shrink-0" />
                      )}
                      {qIndex === 2 && (
                        <span
                          className="shrink-0 flex items-center justify-center"
                          style={{
                            width: 18, height: 18, borderRadius: 6,
                            border: isSelected ? "none" : "1.5px solid #D1D5DB",
                            background: isSelected ? "#1E6FFF" : "transparent",
                            color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0,
                          }}
                        >
                          {isSelected ? "✓" : ""}
                        </span>
                      )}
                      <span className="flex-1 leading-snug">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Subjects Continue button (Q2) */}
            {qIndex === 2 && (selectedSubjects.size > 0 || textVal.trim()) && (
              <button
                disabled={busy}
                onClick={qIndex === 2 ? onSubjectContinue : onInterestContinue}
                className="clay-btn w-full text-sm"
                style={{ height: 52 }}
              >
                {busy ? "Saving…" : "Continue →"}
              </button>
            )}

            {/* Chat-style free-text input (Q2–Q5) */}
            {qIndex >= 2 && (
              <div className="mt-4">
                <form
                  onSubmit={onTextSubmit}
                  className="flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-2.5 shadow-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
                >
                  <input
                    ref={textRef}
                    value={textVal}
                    onChange={(e) => setTextVal(e.target.value)}
                    placeholder="Or type your own answer…"
                    disabled={busy}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={busy || !textVal.trim()}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all disabled:opacity-30 hover:bg-primary/90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.903 6.557H13.5a.75.75 0 0 1 0 1.5H4.182l-1.903 6.557a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.6-7.386.75.75 0 0 0 0-1.128A28.897 28.897 0 0 0 3.105 2.288Z" />
                    </svg>
                  </button>
                </form>
              </div>
            )}

            {infoMessage && (
              <div
                style={{
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  padding: "14px 16px",
                  boxShadow: "0 4px 16px rgba(245,158,11,0.1)",
                }}
              >
                <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://img.icons8.com/3d-fluency/48/idea.png" alt="" width={16} height={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                  {infoMessage}
                </p>
              </div>
            )}

            {error && (
              <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {phase === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            <div
              className="relative flex items-center justify-center"
              style={{ width: 100, height: 100 }}
            >
              <div
                className="absolute inset-0 rounded-full animate-clay-pulse-ring"
                style={{ background: "rgba(30,111,255,0.1)" }}
              />
              <div
                className="absolute animate-clay-spin"
                style={{
                  inset: 10, borderRadius: "50%",
                  border: "3px solid transparent",
                  borderTopColor: "#1E6FFF",
                  borderRightColor: "rgba(30,111,255,0.3)",
                }}
              />
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: 54, height: 54, borderRadius: 18,
                  background: "linear-gradient(145deg, #3B82FF, #1E6FFF)",
                  boxShadow: "0 4px 0 rgba(6,26,138,0.4), 0 8px 24px rgba(30,111,255,0.35)",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>P</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-base font-bold" style={{ color: "#111827" }}>
                Calculating your matches…
              </p>
              <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
                Running the recommendation engine
              </p>
            </div>
          </div>
        )}

        {/* ── Mini-rec result ── */}
        {phase === "result" && (
          <div className="flex flex-1 flex-col gap-6 pb-32">
            {recError || !miniRec ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm" style={{ color: "#6B7280" }}>
                  We couldn&apos;t generate a preview right now, but your answers are saved.
                </p>
                <button
                  onClick={() => router.push(`/deeper?session=${sessionId}`)}
                  className="clay-btn px-8 text-sm"
                  style={{ height: 52 }}
                >
                  Continue to aptitude check →
                </button>
              </div>
            ) : (
              <>
                <div className="clay-card p-6 relative overflow-hidden" style={{ background: "#FFFFFF", borderRadius: 28 }}>
                  {/* Top-right decoration/illustration */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 opacity-15 pointer-events-none">
                    <img src="https://img.icons8.com/3d-fluency/180/combo-chart.png" alt="" className="object-contain w-full h-full" />
                  </div>

                  <div className="mb-6 flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <span className="inline-block rounded-full bg-[#E5EFFF] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#1E6FFF] mb-1.5">
                        Early Estimate
                      </span>
                      <h2 className="text-2xl font-black tracking-tight" style={{ color: "#111827" }}>
                        Your top course matches
                      </h2>
                      <div className="h-1 w-20 bg-[#FFC72C] rounded-full mt-2" />
                    </div>

                    <div
                      className="shrink-0 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center min-w-[76px]"
                      style={{
                        background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                        boxShadow: "0 4px 12px rgba(245,158,11,0.08)",
                      }}
                    >
                      <div className="flex items-center gap-0.5 text-amber-500 mb-0.5">
                        <img src="https://img.icons8.com/3d-fluency/48/combo-chart.png" alt="" width={14} height={14} />
                      </div>
                      <p className="text-xl font-black leading-none text-[#D97706]">
                        {miniRec.overallConfidence}%
                      </p>
                      <p className="text-[8px] font-bold text-[#F59E0B] uppercase tracking-wider mt-1">confidence</p>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {miniRec.top.map((c, i) => {
                      const iconUrl = getCareerIcon(c.leadsTo, c.domain);
                      return (
                        <div
                          key={c.courseId}
                          className="flex items-center gap-4 p-4"
                          style={{
                            background: "#F9FAFB",
                            borderRadius: 20,
                            border: "1.5px solid rgba(30,111,255,0.05)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                          }}
                        >
                          {/* Circular Icon Container with Floating Number Badge */}
                          <div className="relative shrink-0">
                            {/* Floating Number Badge */}
                            <span
                              className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center text-[10px] font-black text-white"
                              style={{
                                borderRadius: "50%",
                                background: i === 0 ? "#1E6FFF" : i === 1 ? "#818CF8" : "#F59E0B",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                border: "1.5px solid #FFF",
                                zIndex: 10,
                              }}
                            >
                              {i + 1}
                            </span>
                            {/* Circle wrapper for 3D icon */}
                            <div
                              className="flex items-center justify-center"
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
                                boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8), 0 4px 10px rgba(99,102,241,0.08)",
                              }}
                            >
                              <img src={iconUrl} alt={c.name} width={36} height={36} className="object-contain" />
                            </div>
                          </div>

                          {/* Info and Progress */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2 mb-1.5">
                              <h3 className="text-sm font-bold text-[#111827] truncate leading-snug">
                                {c.name}
                              </h3>
                              <span className="text-xs font-black text-[#1E6FFF] shrink-0">
                                {c.fitScore}%
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2.5 overflow-hidden rounded-full mb-2 bg-[#E5EDFF]">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${c.fitScore}%`,
                                  background: "linear-gradient(90deg, #3B82FF 0%, #1E6FFF 100%)",
                                  boxShadow: "0 1px 3px rgba(30,111,255,0.2)"
                                }}
                              />
                            </div>

                            {/* Where this course leads */}
                            <span
                              className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold"
                              style={{
                                background: "#EEF2FF",
                                color: "#6366F1",
                              }}
                            >
                              Leads to {c.leadsTo}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Info Callout */}
                  <div
                    className="mt-6 rounded-2xl p-4 flex gap-3 items-start"
                    style={{
                      background: "#EFF6FF",
                      borderLeft: "4px solid #1E6FFF",
                      boxShadow: "0 4px 12px rgba(30,111,255,0.03)",
                    }}
                  >
                    <img src="https://img.icons8.com/3d-fluency/96/idea.png" alt="" width={24} height={24} className="shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-[#1E6FFF] font-medium">
                      These are early estimates based on your quick answers. A short aptitude check — about 5 minutes —
                      will sharpen them significantly and explain the reasoning behind each match.
                    </p>
                  </div>
                </div>

                {/* Inline trust line — the actual Continue lives in the sticky bar below */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <img src="https://img.icons8.com/3d-fluency/48/checkmark.png" alt="" width={12} height={12} />
                    100% free
                  </span>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <img src="https://img.icons8.com/3d-fluency/48/clock.png" alt="" width={12} height={12} />
                    About 5 mins
                  </span>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <img src="https://img.icons8.com/3d-fluency/48/user-male-circle.png" alt="" width={12} height={12} />
                    No account needed
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ── Sticky Continue bar (result phase) — always on screen so students
          never miss the next step and leave early. ── */}
      {phase === "result" && miniRec && !recError && (
        <div
          className="fixed inset-x-0 bottom-0 z-50"
          style={{
            background: "rgba(248,243,236,0.9)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(30,111,255,0.1)",
            boxShadow: "0 -6px 24px rgba(30,111,255,0.08)",
          }}
        >
          <div className="mx-auto w-full max-w-lg px-5 pt-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
            <button
              onClick={() => router.push(`/deeper?session=${sessionId}`)}
              className="w-full relative overflow-hidden flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none cta-glow-pulse"
              style={{
                borderRadius: 20,
                background: "linear-gradient(135deg, #3B82FF 0%, #1E6FFF 100%)",
                border: "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://img.icons8.com/3d-fluency/96/rocket.png" alt="" width={42} height={42} className="shrink-0 animate-pulse" />
              <span className="flex-1 text-left">
                <span className="block text-white text-[15px] font-black leading-tight">
                  Continue for accurate results →
                </span>
                <span className="block text-white/85 text-[10px] font-bold mt-0.5">
                  Unlock a sharper match + the reasoning behind it
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
