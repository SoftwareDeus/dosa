import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

const HEADING_LEVEL_ONE = 1;

describe('/+page.svelte', (): void => {
	it('should render h1', async (): Promise<void> => {
		render(Page);

		const heading = page.getByRole('heading', { level: HEADING_LEVEL_ONE });
		await expect.element(heading).toBeInTheDocument();
	});
});
