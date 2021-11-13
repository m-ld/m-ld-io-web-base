import { fetchJson, HttpError } from './fetch';

type PartOfSpeech = 'noun' | 'adjective' | 'proper-noun';

export interface WordParams {
  includePartOfSpeech: PartOfSpeech;
  maxLength?: number;
}

export async function randomWord(params: WordParams | PartOfSpeech): Promise<string> {
  if (process.env.WORDNIK_API_KEY == null)
    throw new HttpError(500, 'Bad lambda configuration');
  if (typeof params == 'string')
    params = { includePartOfSpeech: params };
  const rtn = await fetchJson<{ word: string; }>(
    'http://api.wordnik.com/v4/words.json/randomWord', {
      api_key: process.env.WORDNIK_API_KEY, ...params
    });
  // Only accept alphabet and hyphen characters
  return /^[a-z\-]+$/.test(rtn.word) ? rtn.word : randomWord(params);
}