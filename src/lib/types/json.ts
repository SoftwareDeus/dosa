export type JsonPrimitive = string | number | boolean | null;
export type Json = JsonPrimitive | { [key: string]: Json } | Json[];
