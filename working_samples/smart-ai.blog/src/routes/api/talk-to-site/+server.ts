import { currentArticles } from '$lib/articles';
import type { ArticleEntry } from '$lib/types';
import { talk_to_articles } from '$lib/ai/ai_interact';
import { json } from '@sveltejs/kit';
import type { TalkToSiteOrArticleResponse, TalkToSiteOrArticleRequest } from '$lib/types';
let allArticles: Map<string, ArticleEntry> = currentArticles;

export const POST = async ({ request }): Promise<Response> => {
    const req: TalkToSiteOrArticleRequest = await request.json();

    if (!req.question || typeof req.question !== 'string') {
        const answer = 'Error: Invalid question format';
        return json({ question: req.question, answer, sources: [] });
    }
    try {
        const response: TalkToSiteOrArticleResponse = await talk_to_articles(req.question, Array.from(allArticles.values()), req.talkSectionItems, req.password);
        return json(response);
    } catch (error) {
        console.error('Error processing question:', error);
        const answer = 'Error: An error occurred while processing your question';
        return json({ question: req.question, answer, sources: [] });
    }
};