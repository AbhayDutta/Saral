import type { Language } from '../i18n';

export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'time'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'password'
  | 'file';

export type FieldStatus = 'empty' | 'filled' | 'needs-review' | 'invalid' | 'skipped';

export interface FieldOption {
  label: string;
  value: string;
}

export interface Field {
  id: string;
  name: string;
  label: string;
  hint?: string;
  type: FieldType;
  required: boolean;
  options?: FieldOption[];
  section?: string;
  selector: string;
}

export interface Schema {
  url: string;
  title: string;
  purpose?: string;
  fields: Field[];
  scannedAt: number;
  pageLanguage?: Language;
}
