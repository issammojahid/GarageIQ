export type CarMake = {
  name: string;
  models: string[];
};

export const CAR_MAKES: CarMake[] = [
  { name: "Acura", models: ["ILX", "MDX", "NSX", "RDX", "RLX", "TLX", "ZDX"] },
  { name: "Alfa Romeo", models: ["Giulia", "Giulietta", "Stelvio", "Tonale"] },
  { name: "Aston Martin", models: ["DB11", "DB12", "DBS", "DBX", "Vantage"] },
  { name: "Audi", models: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "e-tron", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "RS3", "RS6", "RS7", "S3", "S4", "S5", "S6", "SQ5", "SQ7", "TT"] },
  { name: "Bentley", models: ["Bentayga", "Continental GT", "Flying Spur", "Mulsanne"] },
  { name: "BMW", models: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "i3", "i4", "i5", "i7", "iX", "iX3", "M2", "M3", "M4", "M5", "M8", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4"] },
  { name: "Bugatti", models: ["Chiron", "Veyron"] },
  { name: "Buick", models: ["Enclave", "Encore", "Encore GX", "Envision", "LaCrosse", "Verano"] },
  { name: "Cadillac", models: ["CT4", "CT5", "Escalade", "Lyriq", "XT4", "XT5", "XT6"] },
  { name: "Chevrolet", models: ["Blazer", "Bolt EV", "Camaro", "Colorado", "Corvette", "Equinox", "Express", "Impala", "Malibu", "Silverado 1500", "Silverado 2500HD", "Spark", "Suburban", "Tahoe", "Trailblazer", "Traverse", "Trax"] },
  { name: "Chrysler", models: ["300", "Pacifica", "Voyager"] },
  { name: "Citroën", models: ["Berlingo", "C3", "C3 Aircross", "C4", "C4 Cactus", "C5 Aircross", "DS3", "DS5", "SpaceTourer"] },
  { name: "Dacia", models: ["Duster", "Jogger", "Logan", "Sandero", "Spring"] },
  { name: "Dodge", models: ["Challenger", "Charger", "Durango", "Grand Caravan", "Journey", "Ram"] },
  { name: "Ferrari", models: ["296 GTB", "812 Superfast", "F8 Tributo", "Portofino", "Roma", "SF90 Stradale"] },
  { name: "Fiat", models: ["500", "500L", "500X", "Bravo", "Doblo", "Ducato", "Panda", "Punto", "Tipo"] },
  { name: "Ford", models: ["Bronco", "EcoSport", "Edge", "Escape", "Expedition", "Explorer", "F-150", "F-250", "F-350", "Fiesta", "Focus", "Fusion", "Galaxy", "Kuga", "Maverick", "Mondeo", "Mustang", "Mustang Mach-E", "Puma", "Ranger", "S-Max", "Territory", "Transit"] },
  { name: "Genesis", models: ["G70", "G80", "G90", "GV70", "GV80"] },
  { name: "GMC", models: ["Acadia", "Canyon", "Envoy", "Sierra 1500", "Sierra 2500HD", "Terrain", "Yukon"] },
  { name: "Honda", models: ["Accord", "BR-V", "City", "Civic", "CR-V", "CR-Z", "e", "Element", "Fit", "HR-V", "Insight", "Jazz", "Odyssey", "Passport", "Pilot", "Ridgeline", "ZR-V"] },
  { name: "Hyundai", models: ["Accent", "Azera", "Bayon", "Creta", "Elantra", "IONIQ 5", "IONIQ 6", "Kona", "Palisade", "Santa Cruz", "Santa Fe", "Sonata", "Tucson", "Veloster"] },
  { name: "Infiniti", models: ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"] },
  { name: "Jaguar", models: ["E-PACE", "F-PACE", "F-TYPE", "I-PACE", "XE", "XF", "XJ"] },
  { name: "Jeep", models: ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Grand Wagoneer", "Renegade", "Wrangler"] },
  { name: "Kia", models: ["Carnival", "Ceed", "EV6", "Niro", "Picanto", "Rio", "Seltos", "Sorento", "Soul", "Sportage", "Stinger", "Telluride", "XCeed"] },
  { name: "Lamborghini", models: ["Aventador", "Huracán", "Urus"] },
  { name: "Land Rover", models: ["Defender", "Discovery", "Discovery Sport", "Freelander", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"] },
  { name: "Lexus", models: ["CT", "ES", "GS", "GX", "IS", "LC", "LM", "LS", "LX", "NX", "RC", "RX", "UX"] },
  { name: "Lincoln", models: ["Aviator", "Corsair", "Nautilus", "Navigator"] },
  { name: "Maserati", models: ["Ghibli", "GranTurismo", "Grecale", "Levante", "MC20", "Quattroporte"] },
  { name: "Mazda", models: ["CX-3", "CX-30", "CX-5", "CX-50", "CX-60", "CX-9", "MX-5", "Mazda2", "Mazda3", "Mazda6"] },
  { name: "McLaren", models: ["570S", "600LT", "650S", "720S", "765LT", "GT", "P1"] },
  { name: "Mercedes-Benz", models: ["A-Class", "AMG GT", "B-Class", "C-Class", "CLA", "CLS", "E-Class", "EQA", "EQB", "EQC", "EQE", "EQS", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "Marco Polo", "S-Class", "SL", "V-Class"] },
  { name: "MINI", models: ["Clubman", "Convertible", "Countryman", "Coupe", "Hardtop", "Paceman", "Paceman Cooper", "Roadster"] },
  { name: "Mitsubishi", models: ["ASX", "Eclipse Cross", "L200", "Outlander", "Outlander PHEV", "Pajero", "Space Star"] },
  { name: "Nissan", models: ["370Z", "Altima", "Armada", "Frontier", "GTR", "Juke", "Kicks", "Leaf", "Maxima", "Murano", "Navara", "Note", "Pathfinder", "Patrol", "Qashqai", "Rogue", "Sentra", "Titan", "Versa", "X-Trail"] },
  { name: "Opel", models: ["Astra", "Corsa", "Crossland", "Grandland", "Insignia", "Mokka", "Zafira"] },
  { name: "Peugeot", models: ["108", "208", "2008", "308", "3008", "408", "4008", "5008", "508", "Boxer", "Expert", "Partner", "Traveller"] },
  { name: "Porsche", models: ["718 Boxster", "718 Cayman", "911", "Cayenne", "Macan", "Panamera", "Taycan"] },
  { name: "Ram", models: ["1500", "2500", "3500", "ProMaster", "ProMaster City"] },
  { name: "Renault", models: ["Arkana", "Austral", "Captur", "Clio", "Duster", "Espace", "Kangoo", "Master", "Megane", "Megane E-Tech", "Scenic", "Trafic", "Twingo", "Zoe"] },
  { name: "Rolls-Royce", models: ["Cullinan", "Dawn", "Ghost", "Phantom", "Spectre", "Wraith"] },
  { name: "SEAT", models: ["Arona", "Ateca", "Ibiza", "Leon", "Tarraco"] },
  { name: "Skoda", models: ["Enyaq", "Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Scala", "Superb"] },
  { name: "Subaru", models: ["Ascent", "BRZ", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "Solterra", "WRX"] },
  { name: "Suzuki", models: ["Across", "Baleno", "Grand Vitara", "Ignis", "Jimny", "S-Cross", "Swift", "Vitara"] },
  { name: "Tesla", models: ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y", "Roadster"] },
  { name: "Toyota", models: ["4Runner", "Avalon", "Aygo", "bZ4X", "C-HR", "Camry", "Corolla", "Crown", "FJ Cruiser", "GR86", "Highlander", "Land Cruiser", "Mirai", "Prius", "RAV4", "Rush", "Sequoia", "Sienna", "Supra", "Tacoma", "Tundra", "Venza", "Yaris"] },
  { name: "Volkswagen", models: ["Arteon", "Caddy", "Golf", "ID.3", "ID.4", "ID.5", "ID.7", "Passat", "Polo", "Sharan", "T-Cross", "T-Roc", "Taigo", "Tiguan", "Touareg", "Touran", "Transporter", "Up!"] },
  { name: "Volvo", models: ["C40 Recharge", "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"] },
];

export const START_YEAR = 1980;
export const END_YEAR = new Date().getFullYear() + 1;

export function getYears(): number[] {
  const years: number[] = [];
  for (let y = END_YEAR; y >= START_YEAR; y--) {
    years.push(y);
  }
  return years;
}

export function filterMakes(query: string): CarMake[] {
  if (!query.trim()) return CAR_MAKES;
  const q = query.toLowerCase();
  return CAR_MAKES.filter((m) => m.name.toLowerCase().includes(q));
}

export function getModelsForMake(makeName: string, query?: string): string[] {
  const make = CAR_MAKES.find((m) => m.name.toLowerCase() === makeName.toLowerCase());
  if (!make) return [];
  if (!query?.trim()) return make.models;
  const q = query.toLowerCase();
  return make.models.filter((m) => m.toLowerCase().includes(q));
}
