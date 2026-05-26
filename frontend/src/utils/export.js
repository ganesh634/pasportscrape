// CSV Export Helper
export function exportToCSV(posts) {
  if (!posts || posts.length === 0) {
    alert('No posts available to export.');
    return;
  }

  // Define headers
  const headers = ['ID', 'Platform', 'Handle', 'Author', 'Content', 'Category', 'Sentiment', 'Summary', 'Region', 'Language', 'Timestamp', 'Likes', 'Shares', 'Comments'];
  
  // Format rows
  const rows = posts.map(post => [
    post.id,
    post.platform,
    post.handle,
    post.authorName,
    // Escape quotes and clean newlines for CSV
    `"${(post.content || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    post.category,
    post.sentiment,
    `"${(post.summary || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    post.region,
    post.language,
    post.timestamp,
    post.engagement?.likes || 0,
    post.engagement?.shares || 0,
    post.engagement?.comments || 0
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  // Trigger file download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `passport_social_media_report_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// PDF Export Helper
export function exportToPDF(posts) {
  if (!posts || posts.length === 0) {
    alert('No posts available to export.');
    return;
  }

  const printWindow = window.open('', '_blank');
  
  const postsHtml = posts.map((post, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px; font-weight: bold; font-size: 0.85rem;">#${idx + 1}</td>
      <td style="padding: 10px;">
        <div style="font-weight: 600; color: #1e293b;">${post.authorName} (${post.handle})</div>
        <div style="font-size: 0.75rem; color: #64748b;">Platform: ${post.platform} | Region: ${post.region}</div>
      </td>
      <td style="padding: 10px; font-size: 0.85rem;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; background-color: #e0e7ff; color: #4f46e5;">
          ${post.category}
        </span>
        <div style="margin-top: 5px; font-style: italic; font-size: 0.8rem; color: #475569;">
          <strong>Summary:</strong> ${post.summary}
        </div>
      </td>
      <td style="padding: 10px; font-size: 0.85rem; color: #334155;">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</td>
      <td style="padding: 10px; font-weight: 600; font-size: 0.8rem; text-transform: uppercase;">
        <span style="color: ${post.sentiment === 'positive' ? '#16a34a' : post.sentiment === 'negative' ? '#dc2626' : '#4b5563'}">
          ${post.sentiment}
        </span>
      </td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Passport Social Media Aggregate Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
          h1 { margin-bottom: 5px; font-size: 1.8rem; color: #1e1b4b; }
          p { margin-top: 0; color: #64748b; font-size: 0.9rem; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left; padding: 12px 10px; font-size: 0.8rem; text-transform: uppercase; color: #475569; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.75rem; color: #94a3b8; }
        </style>
      </head>
      <body>
        <h1>Passport Social Media Aggregate Report</h1>
        <p>Generated on ${new Date().toLocaleString()} | Filtered items count: ${posts.length}</p>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">No.</th>
              <th style="width: 25%;">Creator & Platform</th>
              <th style="width: 30%;">Classification & Summary</th>
              <th style="width: 30%;">Original Post snippet</th>
              <th style="width: 10%;">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            ${postsHtml}
          </tbody>
        </table>
        <div class="footer">
          Passport Scraper Dashboard &copy; 2026. Powered by Gemini API.
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
