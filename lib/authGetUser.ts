import { SupabaseClient, User } from "@supabase/supabase-js";

export const fetchAndSetUser = async (
    supabaseClient: SupabaseClient,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
    const { data, error } = await supabaseClient.auth.getUser();
    console.log('[getUser]', { data, error });

    if (data?.user) {
        setUser(data.user);
    }

    return { data, error };
};