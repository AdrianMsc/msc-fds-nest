"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractS3KeyFromUrl = extractS3KeyFromUrl;
function extractS3KeyFromUrl(url) {
    try {
        const urlObj = new URL(url);
        return decodeURIComponent(urlObj.pathname).replace(/^\/+/, '');
    }
    catch (err) {
        console.error('Invalid S3 URL:', url);
        return null;
    }
}
//# sourceMappingURL=s3-helpers.js.map