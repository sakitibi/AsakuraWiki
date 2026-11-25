import { supabaseServer } from "@/lib/supabaseClientServer";
import { designColor } from "@/utils/wiki/wiki_settings";

export default async function fetchColor(
    wikiSlugStr: string,
    setDesignColor: (color: designColor | null) => void
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
}

export async function fetchColorParsePlugin(
    slug: string,
    setColor: (color: designColor | null) => void
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