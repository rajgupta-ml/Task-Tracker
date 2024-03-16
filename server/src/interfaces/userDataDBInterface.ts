export interface userDataDBInterface  {
    hsh_password: string;
    user_id: number;
}


export interface userLoginDataResponeInterface {
    jwt: string;
    user_id: number;
}

export interface UserData {
  user_id: number;
}

export interface FrequencyMap {
  [userId: number]: number;
}