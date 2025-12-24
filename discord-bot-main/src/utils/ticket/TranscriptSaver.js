const fs = require('fs');
const path = require('path');
const JsonManager = require('../../../Database/SuperCore/JsonManager');
const json = new JsonManager();

class TranscriptSaver {
  async saveChannelTranscript(channel, fileNameBase) {
    try {
      let messages = [];
      let lastId;
      while (true) {
        const fetched = await channel.messages.fetch({ limit: 100, before: lastId });
        if (fetched.size === 0) break;
        fetched.forEach(m => {
          messages.push({
            id: m.id,
            author: m.author.tag,
            authorId: m.author.id,
            timestamp: m.createdAt.toISOString(),
            content: m.content,
            attachments: m.attachments.map(a => ({ url: a.url, name: a.name }))
          });
        });
        lastId = fetched.last().id;
        if (fetched.size < 100) break;
      }

      // Reverse messages to chronological order
      messages = messages.reverse();

      const transcriptDir = json.resolvePath('tickets/transcripts');
      if (!transcriptDir) return null;
      if (!fs.existsSync(transcriptDir)) fs.mkdirSync(transcriptDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const filePath = path.join(transcriptDir, `${fileNameBase}_${timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify({ channel: channel.id, messages }, null, 2));
      return filePath;
    } catch (error) {
      console.error('Transcript kaydedilemedi:', error);
      return null;
    }
  }

  async saveChannelTranscriptHTML(channel, fileNameBase) {
    try {
      // reuse JSON fetch logic to gather messages
      let messages = [];
      let lastId;
      while (true) {
        const fetched = await channel.messages.fetch({ limit: 100, before: lastId });
        if (!fetched || fetched.size === 0) break;
        fetched.forEach(m => {
          messages.push({
            id: m.id,
            author: m.author.tag,
            authorId: m.author.id,
            timestamp: m.createdAt.toISOString(),
            content: m.content,
            attachments: m.attachments ? m.attachments.map(a => ({ url: a.url, name: a.name })) : []
          });
        });
        lastId = fetched.last().id;
        if (fetched.size < 100) break;
      }
      messages = messages.reverse();

      const transcriptDir = json.resolvePath('tickets/transcripts');
      if (!transcriptDir) return null;
      if (!fs.existsSync(transcriptDir)) fs.mkdirSync(transcriptDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const filePath = path.join(transcriptDir, `${fileNameBase}_${timestamp}.html`);

      const htmlParts = [];
      htmlParts.push('<!doctype html>');
      htmlParts.push('<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Transcript</title>');
      htmlParts.push('<style>body{font-family:Arial,Helvetica,sans-serif;background:#36393f;color:#dcddde;padding:20px} .msg{margin-bottom:12px;padding:8px;border-radius:6px;background:#2f3136} .author{font-weight:700;color:#fff} .time{color:#b9bbbe;font-size:0.9em;margin-left:8px} .content{margin-top:4px}</style>');
      htmlParts.push('</head><body>');
      htmlParts.push(`<h2>Transcript — ${fileNameBase} — ${timestamp}</h2>`);
      messages.forEach(m => {
        htmlParts.push(`<div class="msg">`);
        htmlParts.push(`<div><span class="author">${escapeHtml(m.author)}</span><span class="time">${escapeHtml(m.timestamp)}</span></div>`);
        htmlParts.push(`<div class="content">${escapeHtml(m.content || '')}</div>`);
        if (m.attachments && m.attachments.length) {
          htmlParts.push('<div class="attachments">');
          m.attachments.forEach(a => htmlParts.push(`<div><a href="${escapeHtml(a.url)}" target="_blank">${escapeHtml(a.name || a.url)}</a></div>`));
          htmlParts.push('</div>');
        }
        htmlParts.push('</div>');
      });
      htmlParts.push('</body></html>');

      fs.writeFileSync(filePath, htmlParts.join('\n'));
      return filePath;
    } catch (error) {
      console.error('HTML Transcript kaydedilemedi:', error);
      return null;
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, function (s) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s];
  });
}

module.exports = new TranscriptSaver();
