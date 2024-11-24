import { error, redirect } from '@sveltejs/kit';

import { existingArticlesById, generalForwardMap } from '$lib/articles';
import type { ArticleEntry, ArticleListEntry } from '$lib/types';
import { markdownToHtmlAll } from '$lib/markdown_html_article_combine';

export const csr = false;
export const ssr = true;
export const prerender = true; // when also forwards are included, we can prerender these pages

let allArticles: Map<string, ArticleEntry> = existingArticlesById;

export async function entries() {
    const articlesAndForwards = new Set([...allArticles.keys(), ...generalForwardMap.keys()]);
    return Array.from(articlesAndForwards).map(slug => ({ slug }));
}

export async function load({ params }): Promise<ArticleListEntry> {
    const { slug } = params;

    const article: ArticleEntry | undefined = allArticles.get(slug);
    if (!article) {
        const forwardMapEntry = generalForwardMap.get(slug);
        if (forwardMapEntry) {
            console.log(`Forwarding '${slug}' to '${forwardMapEntry}'`);
            throw redirect(301, forwardMapEntry);
        }
        console.log("Article not found (unknown):", slug);
        throw error(404, `Article not found (unknown): ${slug}`);
    } else {
        try {
            let htmlContent = article.contentType === 'html' ? article.content : await markdownToHtmlAll(article.content);
            return { slug, article: article, htmlContent };
        } catch (err) {
            console.log("Article not found (error):", slug, err);
            throw error(404, `Article not found (error): ${slug}`);
        }
    }
}

