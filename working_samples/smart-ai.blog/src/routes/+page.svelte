<script lang="ts">
	import { featuredArticles, currentArticles } from '$lib/articles';
	import HtmlHeader from '$lib/components/HtmlHeader.svelte';
    import PageTopSection from '$lib/components/PageTopSection.svelte';
    import ListArticlesSimple from '$lib/components/ListArticlesSimple.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import GoogleSiteVerification from '$lib/components/GoogleSiteVerification.svelte';
    import HitTToTalk from '$lib/components/HitTToTalk.svelte';
    let homePageTitle = ""; // empty instead of "Home" so that the blog name is visible in the browser tab
</script>

<GoogleSiteVerification />

<HtmlHeader pageTitle={homePageTitle} />

<HitTToTalk />

<PageTopSection />

<div class="container" style="min-height: 600px;">
    {#if featuredArticles.size > 0}
        <ListArticlesSimple articles={featuredArticles} />
    {/if}
    <ListArticlesSimple articles={currentArticles} />
</div>

<Footer />

