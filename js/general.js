const SUPABASE_URL = 'https://goupqmwvtqovuvbsczzh.supabase.co'
const SUPABASE__ANION_KEY = 'sb_publishable_sYtQmN-mD53u7EwjySci0w_738AeufA'
const supabaseClient =  supabase.createClient(SUPABASE_URL, SUPABASE__ANION_KEY)


let isLoggedIn = false;