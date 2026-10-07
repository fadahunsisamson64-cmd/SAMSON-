import { NextRequest, NextResponse } from 'next/server';
import { ImapFlow } from 'imapflow';

export async function POST(req: NextRequest) {
  const { email, password, query } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: email,
      pass: password,
    },
    logger: false
  });

  try {
    await client.connect();

    // Select INBOX
    const lock = await client.getMailboxLock('INBOX');
    const messages = [];

    try {
      // Search for messages
      // query can be something like 'Lumina' or just return recent ones
      const searchCriteria: any = query ? { text: query } : { all: true };
      
      // Get the last 10 messages
      const searchResults = await client.search(searchCriteria) || [];
      const last10 = searchResults.slice(-10).reverse();

      for (const seq of last10) {
        const message = await client.fetchOne(seq.toString(), {
          envelope: true,
          bodyStructure: true,
          flags: true,
        });
        
        if (message) {
          messages.push({
            uid: message.uid,
            subject: message.envelope?.subject,
            from: message.envelope?.from?.[0]?.address,
            date: message.envelope?.date,
            flags: Array.from(message.flags || []),
          });
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('IMAP error:', error);
    try { await client.logout(); } catch (e) {}
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to search emails' 
    }, { status: 500 });
  }
}
