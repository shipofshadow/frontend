// Represents one fuzzy set (like "low", "medium", "high")
export interface FuzzySetConfig {
    description: string;       // e.g. "low", "medium", "high"
    eligibility: string;       // e.g. "Eligible", "Not Eligible"
    param_a: number;
    param_b: number;
    param_c: number;
}

// Represents a fuzzy variable (like "gwa" or "income")
export interface FuzzyVariableConfig {
    variable_id: number;
    variable_name: string;     // e.g. "gwa", "income"
    description: string;       // human-readable description
    sets: FuzzySetConfig[];    // all sets belonging to this variable
}

// The full config = array of variables
export type FuzzyConfig = FuzzyVariableConfig[];
