import { json, type RequestHandler } from '@sveltejs/kit';
import { HttpStatus } from '$lib/types/http';
import { anthropic, DEFAULT_MODEL } from '$lib/server/ai';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check if user is authenticated
		const {
			data: { session }
		} = await locals.supabase.auth.getSession();
		if (!session) {
			return json({ error: 'Unauthorized' }, { status: HttpStatus.UNAUTHORIZED });
		}

		const { messages } = await request.json();

		if (!messages || !Array.isArray(messages)) {
			return json({ error: 'Invalid messages format' }, { status: HttpStatus.BAD_REQUEST });
		}

		// Create extraction prompt
		const extractionPrompt = `Analysiere den folgenden Chat-Verlauf und extrahiere alle Gesundheitsinformationen, die der Benutzer erwähnt hat.

Erstelle eine strukturierte JSON-Antwort mit folgenden Feldern (nur Felder einbeziehen, die tatsächlich erwähnt wurden):
- age: Alter als Zahl
- height: Größe in cm als Zahl
- weight: Gewicht in kg als Zahl
- bloodType: Blutgruppe als String (z.B. "A+", "0-", etc.)
- allergies: Allergien als String (wenn keine: weglassen)
- medications: Aktuelle Medikamente als String (wenn keine: weglassen)
- conditions: Vorerkrankungen/chronische Erkrankungen als String (wenn keine: weglassen)

Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text.

Chat-Verlauf:
${messages.map((m: any) => `${m.role === 'user' ? 'Benutzer' : 'Assistent'}: ${m.content}`).join('\n\n')}`;

		const response = await anthropic.messages.create({
			model: DEFAULT_MODEL,
			max_tokens: 1024,
			messages: [
				{
					role: 'user',
					content: extractionPrompt
				}
			]
		});

		const content = response.content[0];
		if (content.type !== 'text') {
			throw new Error('Unexpected response type');
		}

		// Parse the JSON response
		let extractedData: any;
		try {
			// Try to extract JSON from the response (Claude might add some text around it)
			const jsonMatch = content.text.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				extractedData = JSON.parse(jsonMatch[0]);
			} else {
				extractedData = JSON.parse(content.text);
			}
			
			// Validate that we got at least some data
			if (!extractedData || typeof extractedData !== 'object') {
				throw new Error('Invalid extraction result');
			}
			
			console.log('Successfully extracted health data:', extractedData);
		} catch (e) {
			console.error('Failed to parse extracted data:', content.text);
			console.error('Parse error:', e);
			return json(
				{ 
					error: 'Failed to extract structured data from conversation',
					details: content.text.substring(0, 200) // First 200 chars for debugging
				},
				{ status: HttpStatus.INTERNAL_SERVER_ERROR }
			);
		}

		return json({ ok: true, data: extractedData });
	} catch (error) {
		console.error('Extract health data error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: HttpStatus.INTERNAL_SERVER_ERROR }
		);
	}
};

export const prerender = false;

