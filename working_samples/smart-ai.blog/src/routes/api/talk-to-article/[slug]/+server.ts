import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { existingArticlesById } from '$lib/articles';
import type { ArticleEntry } from '$lib/types';
import { talk_to_articles } from '$lib/ai/ai_interact.js';
import type { TalkToSiteOrArticleResponse } from '$lib/types';
let allArticles: Map<string, ArticleEntry> = existingArticlesById;

export const POST = async ({ request }): Promise<Response> => {
    const { slug, question, password } = await request.json();

    const article: ArticleEntry | undefined = allArticles.get(slug);
    if (!article) {
        console.log("Article to talk to not found (unknown):", slug);
        throw error(404, `Article to talk to not found (unknown): ${slug}`);
    } else {
        try {
            const response: TalkToSiteOrArticleResponse = await talk_to_articles(question, [article], [], password);
            return json(response);
        } catch (err) {
            console.log("Article not found (error):", slug, err);
            throw error(404, `Article not found (error): ${slug}`);
        }
    }
}