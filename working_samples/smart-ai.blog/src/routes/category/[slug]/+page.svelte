<script lang="ts">
	import { currentArticles } from '$lib/articles';
	import HtmlHeader from '$lib/components/HtmlHeader.svelte';
    import PageTopSection from '$lib/components/PageTopSection.svelte';
    import ListArticlesSimple from '$lib/components/ListArticlesSimple.svelte';
    import Footer from '$lib/components/Footer.svelte';

    import { page } from '$app/stores';
    import { error } from '@sveltejs/kit';
    import type { ArticleEntry } from '$lib/types';

    // Get the category slug from the page params
    const slug = $page.params.slug;
    // Filter articles based on the category slug
    const categoryArticlesForCategory: ArticleEntry[] = Array.from(currentArticles.values()).filter((article) => 
        !article.categories || (article.categories && article.categories.some(category => category === slug))
    );
    const categoryArticles = new Map(categoryArticlesForCategory.map(article => [article.id, article]));
    const sectionTitle = 'Articles for category "' + slug + '"';

    if (categoryArticles.size === 0) {
        throw error(404, `No articles found for category: ${slug}`);
    }
</script>

<HtmlHeader pageTitle={sectionTitle} />

<PageTopSection />

<div class="container" style="min-height: 600px;">
    <ListArticlesSimple articles={categoryArticles} sectionTitle={sectionTitle} />
</div>

<Footer />