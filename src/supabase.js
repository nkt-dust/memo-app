// createClientという道具をsupabaseから借りてくる
import {createClient}from '@supabase/supabase-js';
// supabaseの場所（url）とデータを出すための鍵を渡す
const supabaseUrl=import.meta.env.VITE_SUPABASE_URL;
const supabaseKey=import.meta.env.VITE_SUPABASE_KEY;
// 住所（url）と鍵（key）を使ってsupabaseとやり取りするための道具(supabase)をほかのファイルでも使えるようにする。。
export const supabase=createClient(supabaseUrl,supabaseKey);

