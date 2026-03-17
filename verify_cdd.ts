import { fetchCDD } from './src/lib/api.ts';
import { formatCDD } from './src/lib/formatters.ts';

async function test() {
    try {
        const data = await fetchCDD();
        console.log("Formatting CDD...", data);
        const formatted = formatCDD(data);
        console.log("SUCCESS");
    } catch (e) {
        console.error("FORMAT_ERROR", e);
    }
}
test();
