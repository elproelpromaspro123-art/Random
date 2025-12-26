const DOMAIN = 'https://cementerio-de-secretos-y-confesiones.vercel.app';

function generateSiteMap() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${DOMAIN}/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>
`;
}

export async function getServerSideProps({ res }) {
    try {
        const sitemap = generateSiteMap();

        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
        res.write(sitemap);
        res.end();

        return {
            props: {},
        };
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).json({ error: 'Error generating sitemap' });
        return {
            props: {},
        };
    }
}

export default function Sitemap() {
    return null;
}
