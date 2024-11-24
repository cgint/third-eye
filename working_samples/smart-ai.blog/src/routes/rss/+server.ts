import { Feed } from 'feed';
import { existingArticlesById } from '$lib/articles';
import { WEB_PAGE_URL } from '$lib/page_constants';

export const prerender = false; // needs to take publishedAt into account

export const GET = async ({ request }): Promise<Response> => {
    const newestArticleDate = Array.from(existingArticlesById.values()).reduce((maxDate, article) => {
        return maxDate > article.publishedAt ? maxDate : article.publishedAt;
    }, new Date());

    const feed = new Feed({
        title: "Cursor AI Blog",
        description: "A blog about AI and programming",
        id: WEB_PAGE_URL,
        link: WEB_PAGE_URL,
        language: "en",
        image: WEB_PAGE_URL + "/favicon_dall-e.png",
        favicon: WEB_PAGE_URL + "/favicon_dall-e.png",
        copyright: "&copy; 2024 Smart AI Blog.",
        updated: newestArticleDate,
        generator: "Feed for Node.js",
        feedLinks: {
            rss2: WEB_PAGE_URL + "/rss"
        },
    });

    for (const [id, article] of existingArticlesById) {
        feed.addItem({
            title: article.overviewTitle,
            id: WEB_PAGE_URL + "/" + id,
            link: WEB_PAGE_URL + "/" + id,
            description: article.overviewDescription,
            content: article.content,
            author: [{name: article.author}],
            date: article.updatedAt ?? article.publishedAt,
            published: article.publishedAt
        });
    }

    return new Response(feed.rss2(), {
        headers: {
            'Content-Type': 'application/rss+xml'
        }
    });
}