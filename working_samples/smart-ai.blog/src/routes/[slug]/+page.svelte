<script lang="ts">
    import type { ArticleListEntry } from '$lib/types';
    export let data: ArticleListEntry;
    import HtmlHeader from '$lib/components/HtmlHeader.svelte';
    import PageTopSection from '$lib/components/PageTopSection.svelte';
    import BlogPost from '$lib/components/BlogPost.svelte';
    import Footer from '$lib/components/Footer.svelte';
</script>

<HtmlHeader pageTitle={data.article.overviewTitle} description={data.article.overviewDescription} />

<PageTopSection />

<BlogPost data={data} />

<Footer />