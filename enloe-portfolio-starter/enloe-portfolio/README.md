# Jacob Enloe Portfolio

A responsive, static multi-page portfolio designed for deployment with Cloudflare Pages and GitHub integration.

## Pages
- `index.html` — homepage / overview
- `projects.html` — selected projects
- `resume.html` — education, skills, and experience
- `contact.html` — contact links

## Before publishing
1. Replace `YOUR_EMAIL@example.com` on `contact.html`.
2. Add your real LinkedIn and GitHub profile URLs.
3. Verify every resume title, date, and accomplishment.
4. Add a PDF résumé and link it from `resume.html` when ready.
5. Add project images, original paper links, and substantiated results.
6. Review all content before making the site public.

## Deploy
Create a GitHub repository and upload these files to its root. In Cloudflare, open **Workers & Pages → Create application → Pages → Connect to Git**, select the repository, and deploy. After the first successful deployment, add `enloe.net` under the project's **Custom domains** settings. Do not overwrite existing email-related DNS records.

This site uses plain HTML, CSS, and JavaScript; no build command or framework is required.
