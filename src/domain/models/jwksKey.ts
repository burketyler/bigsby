export interface JwksKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}

export interface JwksKeySet {
  keys: JwksKey[];
}
