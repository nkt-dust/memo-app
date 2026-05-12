// useStateとuseEffectという道具をreactから借りてくる
import {useState,useEffect}from"react";
// supabase（データの倉庫）から、supabaseというデータを持ってくる
import{supabase}from "./supabase";
// アプリの起動時に一回だけ、supabaseにデータを取りに行き、メモかエラーをコンソールに表示する。
function App(){
  // 「memos=メモのデータの入る箱」「setMemos=メモが変更されると自動で画面を更新する」最初は空の配列（[]）
  const[memos,setMemos]=useState([]);
  // 「useEffect(()=>{
  // <ここに実行したいこと>
  // },[]);」でuseEffectは起動時に一回だけ｛｝内を実行する。最後の[]の書き方でuseEffectの動きが変わる。
  // アプリの起動時に一回だけ(fetchMemos)を実行する
  useEffect(()=>{
    // 下のfetchMemos関数の実行。（supabaseの指定の場所から指定のデータを取ってきて指定の順番に並べる。メモを作成し画面を更新。supabaseからのデータの取得に失敗したらエラーを表示）
    fetchMemos();
  },[]);
  // fetchMemos関数。asyncの宣言をすることで、await（処理が終わるまで先に進まない）が使えるようになる。
  async function fetchMemos(){
    // supabaseからデータを取ってくるまで進まない。取ってきたデータはdataかerrorに入る。error=supabaseとの通信接続が失敗したとき
    // supabaseは常にdataとerrorを返している。（必ず、片方が値、片方はnull）
    // supabase=成功時は{data:[配列],error:null}を返す。supabaseから１つのconstでdataとerrorの２つ同時に箱にそのまま移す。
    // 「.」はメソッドチェーン。前の命令の結果に続けて命令をする。
    const{data,error}=await supabase
    // supabaseの「memos」からデータを取ってくる（場所の指定）
    .from('memos')
    // 「memos」という場所から、「*」すべて取ってくる
    .select('*')
    // 「order=命令」「created_at=supabaseの列（timestamptz=いつ追加されたかという時間情報）」「ascending=＜上昇するという意味＞昇順にするか（並べ方）→falseなので降順」
    // created_atの列をみて、ascending:false順に並べてという命令
    .order('created_at',{ascending:false});
    // もしもerrorの箱に値が入っていたら
    if(error){
      // 「エラー」という文字と「errorの値」を表示
      console.log('エラー',error);
      // エラーが起きたらそれ以上は進まない
      return;
    }
    // dataに値が入っていたら（成功）、setMemos関数を実行（データをmemosの箱に入れ、メモと画面を更新）
    setMemos(data);
  }
  // 以下の画面の設計図をReactに返す
  return(
    <div>
      <h1>メモアプリ</h1>
      {/* 順序なしリスト。<li>の親 */}
      <ul>
        {/* memos(オブジェクト)の中からひとつずつ取り出して加工していく。memoというラベルをつけていく */}
        {memos.map((memo)=>(
          // 「key=Reactが各要素を識別する目印」。メモを番号で管理している。
          <li key={memo.id}>
            {/* 該当するデータのtitleとcontentを表示する */}
            <h3>{memo.title}</h3>
            <p>{memo.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;