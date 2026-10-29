import { create } from 'zustand';
import type { FieldOption, FieldStatus, Schema } from '@/lib/schema/types';

interface FormState {
  schema: Schema | null;
  values: Record<string, string>;
  statuses: Record<string, FieldStatus>;
  confidence: Record<string, number>;
  confirmed: Record<string, boolean>;
  setSchema: (schema: Schema | null) => void;
  setValues: (values: Record<string, string>, confidence?: Record<string, number>) => void;
  setValue: (id: string, value: string) => void;
  setStatuses: (statuses: Record<string, FieldStatus>) => void;
  setStatus: (id: string, status: FieldStatus) => void;
  applyLocalization: (localization: {
    title?: string;
    purpose?: string;
    fields: Record<string, { label: string; hint?: string; options?: FieldOption[] }>;
  }) => void;
  toggleConfirmed: (id: string) => void;
  reset: () => void;
}

const initial = {
  schema: null,
  values: {},
  statuses: {},
  confidence: {},
  confirmed: {},
};

export const useFormStore = create<FormState>((set) => ({
  ...initial,

  setSchema: (schema) => set({ ...initial, schema }),

  setValues: (values, confidence = {}) => set({ values, confidence }),

  setValue: (id, value) =>
    set((state) => ({ values: { ...state.values, [id]: value } })),

  setStatuses: (statuses) => set({ statuses }),

  setStatus: (id, status) =>
    set((state) => ({ statuses: { ...state.statuses, [id]: status } })),

  applyLocalization: ({ title, purpose, fields }) =>
    set((state) => {
      if (!state.schema) return {};

      return {
        schema: {
          ...state.schema,
          title: title ?? state.schema.title,
          purpose,
          fields: state.schema.fields.map((field) => {
            const localized = fields[field.id];
            return localized ? { ...field, ...localized } : field;
          }),
        },
      };
    }),

  toggleConfirmed: (id) =>
    set((state) => ({
      confirmed: { ...state.confirmed, [id]: !state.confirmed[id] },
    })),

  reset: () => set(initial),
}));
