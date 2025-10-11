<script lang="ts">
    import type { PageData } from './$types';
    import { AiHealthChat } from '$lib/components';
    
    export let data: PageData;
</script>

<AiHealthChat {data} />

