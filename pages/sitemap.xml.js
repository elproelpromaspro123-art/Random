import pool from '../lib/db';

const DOMAIN = 'https://cementerio-secretos.vercel.app';

function generateSiteMap(secrets) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${DOMAIN}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    ${secrets
        .map(({ id, created_at }) => {
            return `
    <url>
        <loc>${DOMAIN}?highlight=${id}</loc>
        <lastmod>${new Date(created_at).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        })
        .join('')}
</urlset>
`;
}

export async function getServerSideProps({ res }) {
    try {
        // Obtener últimos 50k secretos (Google sitemap máx 50k URLs)
        const query = `
            SELECT id, created_at 
            FROM secrets 
            WHERE is_deleted = false 
            ORDER BY created_at DESC 
            LIMIT 50000
        `;
        
        const result = await pool.query(query);
        const secrets = result.rows;

        const sitemap = generateSiteMap(secrets);

        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        res.write(sitemap);
        res.end();

        return {
            props: {},
        };
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).end();
        return {
            props: {},
        };
    }
}

export default function Sitemap() {
    return null;
}
