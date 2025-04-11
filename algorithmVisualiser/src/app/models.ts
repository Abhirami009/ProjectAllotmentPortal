export interface StepState {
	message: string;
	assignments: { [key: string]: number };
	studentPref: { [key: string]: string[] };
	projectState: { [key: string]: { assigned: string[]; capacity: number } };
  }

  export interface Preference {
	student : string,
	project : string,
	preference_rank : number
  }

