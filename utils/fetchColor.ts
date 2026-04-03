import { supabaseServer } from "@/lib/supabaseClientServer";
import { designColor } from "@/utils/wiki_settings";

export default async function fetchColor(
    wikiSlugStr: string,
    setDesignColor: React.Dispatch<React.SetStateAction<designColor | null>>
) {
    const { data, error } = await supabaseServer
    .from('wikis')
    .select('design_color')
    .eq('slug', wikiSlugStr)
    .single();

    if (error) {
        console.error('デザインカラー取得エラー:', error);
        return;
    }

    setDesignColor(data.design_color as any);
    console.log('wikiSlugStr:', wikiSlugStr); // ← これが undefined や空文字なら原因！
    console.log('取得したdesign_color:', data?.design_color);
}

export async function fetchColorParsePlugin(
    slug: string,
    setColor: React.Dispatch<React.SetStateAction<designColor | null>>
) {
    const { data, error } = await supabaseServer
        .from('wikis')
        .select('design_color')
        .eq('slug', slug)
        .single();

    if (error || !data) {
        setColor('default');
        return;
    }

    setColor(data.design_color);
}