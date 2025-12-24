const { expect } = require('chai');
const TranscriptSaver = require('../../src/utils/ticket/TranscriptSaver');
const fs = require('fs');
const path = require('path');

class FakeMessage {
  constructor(id, authorTag, authorId, createdAt, content, attachments = []) {
    this.id = id;
    this.author = { tag: authorTag, id: authorId };
    this.createdAt = createdAt;
    this.content = content;
    this.attachments = attachments;
  }
}

class FakeCollection {
  constructor(arr) {
    this._arr = arr;
    this.size = arr.length;
  }
  forEach(fn) { this._arr.forEach(fn); }
  last() { return this._arr[this._arr.length - 1]; }
}

class FakeChannel {
  constructor(id, messages) {
    this.id = id;
    this.messages = { fetch: async ({ limit, before } = {}) => new FakeCollection(messages) };
  }
}

describe('TranscriptSaver', () => {
  it('saves JSON transcript', async () => {
    const messages = [
      new FakeMessage('1', 'User#0001', '111', new Date('2025-12-23T10:00:00Z'), 'hello'),
      new FakeMessage('2', 'User#0002', '222', new Date('2025-12-23T10:01:00Z'), 'hi')
    ];
    const ch = new FakeChannel('chan1', messages);
    const res = await TranscriptSaver.saveChannelTranscript(ch, 'testtrans');
    expect(res).to.be.a('string');
    expect(fs.existsSync(res)).to.be.true;
    const data = JSON.parse(fs.readFileSync(res, 'utf8'));
    expect(data).to.have.property('channel', 'chan1');
    expect(data.messages).to.be.an('array').that.has.length(2);
    // cleanup
    fs.unlinkSync(res);
  });

  it('saves HTML transcript', async () => {
    const messages = [
      new FakeMessage('1', 'User#0001', '111', new Date('2025-12-23T10:00:00Z'), 'hello'),
      new FakeMessage('2', 'User#0002', '222', new Date('2025-12-23T10:01:00Z'), 'hi')
    ];
    const ch = new FakeChannel('chan1', messages);
    const res = await TranscriptSaver.saveChannelTranscriptHTML(ch, 'testtrans');
    expect(res).to.be.a('string');
    expect(fs.existsSync(res)).to.be.true;
    const data = fs.readFileSync(res, 'utf8');
    expect(data).to.include('Transcript');
    expect(data).to.include('User#0001');
    // cleanup
    fs.unlinkSync(res);
  });
});