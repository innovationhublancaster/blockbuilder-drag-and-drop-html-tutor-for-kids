// src/lib/htmlSanitizer.ts

import DOMPurify from 'dompurify';

/**
 * sanitizeHtmlContent - Sanitizes HTML content to ensure it is safe to embed in an iframe's srcdoc.
 * 
 * This function uses the DOMPurify library to remove disallowed tags and attributes,
 * enforcing a strict Content Security Policy (CSP) that blocks external resources.
 *
 * @param {string} htmlContent - The raw HTML content to be sanitized.
 * @returns {string} - The sanitized HTML content safe for embedding in srcdoc.
 */
function sanitizeHtmlContent(htmlContent: string): string {
    // Create a DOMPurify window instance with strict CSP settings
    const purify = DOMPurify(window);

    // Define the configuration for DOMPurify
    const config: DOMPurify.Config = {
        SAFE_FOR_JQUERY: true, // Allow usage of jQuery-like selectors
        ALLOWED_TAGS: ['div', 'span', 'p', 'strong', 'em', 'a'], // Whitelist of allowed tags
        ALLOWED_ATTR: ['href', 'target'], // Whitelist of allowed attributes
        FORBID_TAGS: ['script', 'style'], // Additional forbidden tags to ensure no scripts or styles are included
        FORBID_ATTR: ['onerror', 'onload'], // Additional forbidden attributes for event handlers
        ADD_TAGS: [], // No additional tags should be added
        ADD_ATTR: [], // No additional attributes should be added
        WHOLE_DOCUMENT: false, // Do not treat input as a complete HTML document
        RETURN_DOM: false, // Return the sanitized string instead of a DOM element
        RETURN_DOM_FRAGMENT: false, // Do not return a DOM fragment
    };

    // Sanitize the HTML content using the configured settings
    const sanitizedHtml = purify.sanitize(htmlContent, config);

    return sanitizedHtml;
}

export default sanitizeHtmlContent;