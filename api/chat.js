import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { conversations, messages } from '@wix/inbox';
import { contacts } from '@wix/contacts';

// Initialize Wix Client using Admin API Key
const wixClient = createClient({
  modules: { conversations, messages, contacts },
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY || '',
    siteId: process.env.WIX_SITE_ID || '',
  }),
});

export default async function handler(req, res) {
  // Set CORS and JSON headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get action from query or body
  const action = req.query?.action || req.body?.action;

  if (!action) {
    return res.status(400).json({ error: 'Missing action parameter' });
  }

  // Verify env keys are set
  if (!process.env.WIX_API_KEY || !process.env.WIX_SITE_ID) {
    return res.status(500).json({
      error: 'Wix credentials not configured on backend. Please configure WIX_API_KEY and WIX_SITE_ID in Vercel.',
    });
  }

  try {
    if (action === 'init') {
      const { name, email } = req.body || {};
      if (!email) {
        return res.status(400).json({ error: 'Email is required for chat initialization' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name?.trim() || 'Visitor';

      let contactId = null;

      // 1. Query CRM contacts to see if contact exists
      try {
        const queryRes = await wixClient.contacts.queryContacts()
          .eq('info.emails.address', cleanEmail)
          .limit(1)
          .find();

        if (queryRes.items && queryRes.items.length > 0) {
          contactId = queryRes.items[0]._id || queryRes.items[0].id;
        }
      } catch (err) {
        console.error('[WixChat API] Error querying contacts:', err);
      }

      // 2. If contact does not exist, create it
      if (!contactId) {
        try {
          const createRes = await wixClient.contacts.createContact({
            contact: {
              info: {
                name: { first: cleanName },
                emails: [
                  {
                    tag: 'MAIN',
                    address: cleanEmail,
                    primary: true,
                  },
                ],
              },
            },
          });
          contactId = createRes.contact?._id || createRes.contact?.id;
        } catch (err) {
          console.error('[WixChat API] Error creating contact:', err);
          return res.status(500).json({ error: 'Failed to create contact in CRM', details: err.message || err });
        }
      }

      if (!contactId) {
        return res.status(500).json({ error: 'Failed to retrieve or create contact ID' });
      }

      // 3. Get or create conversation for the contact
      try {
        const convoRes = await wixClient.conversations.getOrCreateConversation({
          participant: {
            contactId: contactId,
          },
        });
        const conversationId = convoRes.conversation?.id || convoRes.id;
        return res.status(200).json({ conversationId, contactId });
      } catch (err) {
        console.error('[WixChat API] Error creating conversation:', err);
        return res.status(500).json({ error: 'Failed to initialize conversation', details: err.message || err });
      }

    } else if (action === 'list') {
      const conversationId = req.query?.conversationId || req.body?.conversationId;
      if (!conversationId) {
        return res.status(400).json({ error: 'conversationId is required' });
      }

      try {
        const msgRes = await wixClient.messages.listMessages(conversationId, 'BUSINESS_AND_PARTICIPANT');
        return res.status(200).json(msgRes);
      } catch (err) {
        console.error('[WixChat API] Error listing messages:', err);
        return res.status(500).json({ error: 'Failed to list messages', details: err.message || err });
      }

    } else if (action === 'send') {
      const { conversationId, text } = req.body || {};
      if (!conversationId || !text) {
        return res.status(400).json({ error: 'conversationId and text are required' });
      }

      try {
        const sendRes = await wixClient.messages.sendMessage(
          conversationId,
          {
            content: {
              basic: {
                items: [{ text }],
              },
            },
            direction: 'PARTICIPANT_TO_BUSINESS',
            visibility: 'BUSINESS_AND_PARTICIPANT',
          },
          {
            sendAs: 'PARTICIPANT',
          }
        );
        return res.status(200).json(sendRes);
      } catch (err) {
        console.error('[WixChat API] Error sending message:', err);
        return res.status(500).json({ error: 'Failed to send message', details: err.message || err });
      }

    } else {
      return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (globalErr) {
    console.error('[WixChat API] Unexpected handler error:', globalErr);
    return res.status(500).json({ error: 'Internal Server Error', details: globalErr.message || globalErr });
  }
}
