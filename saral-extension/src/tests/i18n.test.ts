import { describe, expect, it } from 'vitest';
import { LANGUAGES, SARVAM_CODE_MAP, t } from '../lib/i18n';
import { translationPrompt, translationSystem } from '../lib/ai/prompts';

describe('i18n multilingual support', () => {
  it('translates UI strings into Bengali', () => {
    expect(t('scan', 'bn')).toBe('স্ক্যান');
    expect(t('speak', 'bn')).toBe('বলুন');
    expect(t('review', 'bn')).toBe('যাচাই');
    expect(t('done', 'bn')).toBe('সম্পন্ন');
    expect(t('fillForm', 'bn')).toBe('ফর্ম পূরণ করুন');
  });

  it('translates UI strings into Assamese', () => {
    expect(t('scan', 'as')).toBe('স্কেন');
    expect(t('speak', 'as')).toBe('কওক');
    expect(t('review', 'as')).toBe('পৰীক্ষা');
    expect(t('done', 'as')).toBe('সম্পূৰ্ণ');
    expect(t('fillForm', 'as')).toBe('প্ৰপত্ৰ পূৰণ কৰক');
  });

  it('translates UI strings into Hindi', () => {
    expect(t('scan', 'hi')).toBe('स्कैन');
    expect(t('speak', 'hi')).toBe('बोलें');
    expect(t('fillForm', 'hi')).toBe('फ़ॉर्म भरें');
  });

  it('translates UI strings into Marathi', () => {
    expect(t('scan', 'mr')).toBe('स्कॅन');
    expect(t('speak', 'mr')).toBe('बोला');
    expect(t('fillForm', 'mr')).toBe('अर्ज भरा');
  });

  it('translates UI strings into Tamil', () => {
    expect(t('scan', 'ta')).toBe('ஸ்கேன்');
    expect(t('speak', 'ta')).toBe('பேசுங்கள்');
    expect(t('fillForm', 'ta')).toBe('படிவம் நிரப்பு');
  });

  it('maps all supported languages to Sarvam BCP-47 codes', () => {
    expect(SARVAM_CODE_MAP.as).toBe('as-IN');
    expect(SARVAM_CODE_MAP.bn).toBe('bn-IN');
    expect(SARVAM_CODE_MAP.hi).toBe('hi-IN');
    expect(SARVAM_CODE_MAP.ta).toBe('ta-IN');
    expect(SARVAM_CODE_MAP.te).toBe('te-IN');
    expect(SARVAM_CODE_MAP.en).toBe('en-IN');
    expect(LANGUAGES.length).toBe(15);
  });

  it('generates translation prompt and system message for chosen language', () => {
    const sys = translationSystem('bn');
    expect(sys).toContain('Bengali');
    expect(sys).toContain('বাংলা');

    const prompt = translationPrompt(
      {
        url: 'https://example.com',
        title: 'Application Form',
        fields: [{ id: 'name', name: 'name', label: 'Full Name', type: 'text', required: true, selector: '#name' }],
        scannedAt: Date.now(),
      },
      'bn',
    );
    expect(prompt).toContain('Bengali');
    expect(prompt).toContain('বাংলা');
    expect(prompt).toContain('Full Name');
  });
});
